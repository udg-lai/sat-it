<script lang="ts">
	import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from 'cytoscape';
	import dagre from 'cytoscape-dagre';
	import { onMount, type Component } from 'svelte';

	import {
		getImplicationGraph,
		type IG_Node,
		type ImplicationGraph
	} from '$lib/entities/ImplicationGraph.svelte.ts';

	import { getCssVariable, hex8ToRgba, mulberry32 } from '$lib/utils.ts';

	import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';

	import ConflictNode from './nodes/ConflictNodeComponent.svelte';
	import DecisionNode from './nodes/DecisionNodeComponent.svelte';
	import PropagationNode from './nodes/PropagationNodeComponent.svelte';

	import type { ConflictAnalysis } from '$lib/entities/ConflictAnalysis.svelte.ts';
	import Literal from '$lib/entities/Literal.svelte.ts';
	import { toolPanelResizedEventBus, updatedImplicationGraph } from '$lib/events/events.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { obtainConflictAnalysis } from '$lib/states/conflict-analysis.svelte.ts';

	/*
	 * Svelte components that will be rendered inside the Cytoscape nodes.
	 *
	 * Change these imports to your actual components.
	 */

	cytoscape.use(dagre);

	let container: HTMLDivElement;
	let cy: Core | undefined;

	let visitingNodeId: string | undefined = $state(undefined);

	let graph: Maybe<ImplicationGraph> = $derived(getImplicationGraph());

	let conflictAnalysis: Maybe<ConflictAnalysis> = $derived(obtainConflictAnalysis());

	let pivotingVariableAssignment: Maybe<VariableAssignment> = $derived.by(() => {
		if (graph.isNothing()) return makeNothing();

		if (conflictAnalysis.isNothing()) return makeNothing();

		const ca: ConflictAnalysis = conflictAnalysis.fromJust();

		if (ca.finished()) return makeNothing();

		return makeJust(ca.getPivotingAssignment());
	});

	/*
	 * ------------------------------------------------------------------------
	 * Svelte overlay nodes
	 * ------------------------------------------------------------------------
	 */

	type OverlayNode = {
		id: string;
		x: number;
		y: number;

		component: Component;

		props: {
			id: string;
			selected: boolean;
			pivoting: boolean;
		};
	};

	let overlayNodes = $state<OverlayNode[]>([]);

	/*
	 * Select which Svelte component should render a given Cytoscape node.
	 */
	function getNodeComponent(nodeId: string): Component {
		const g = graph.fromJust();

		if (g.falsumId() === nodeId) {
			return ConflictNode;
		}

		if (g.decisionsIds().has(nodeId)) {
			return DecisionNode;
		}

		return PropagationNode;
	}

	// Update the Svelte overlay so that every component follows
	// the actual rendered Cytoscape position.
	function updateOverlayPositions() {
		if (!cy) return;

		overlayNodes = cy.nodes().map((node) => {
			const position = node.renderedPosition();

			return {
				id: node.id(),
				x: position.x,
				y: position.y,

				component: getNodeComponent(node.id()),

				props: {
					id: node.id(),
					selected: node.selected(),
					pivoting: node.id() === visitingNodeId
				}
			};
		});
	}

	/*
	 * ------------------------------------------------------------------------
	 * Selection
	 * ------------------------------------------------------------------------
	 */

	function visitNode(visitingNodeID: string) {
		if (!cy) return;

		if (graph.isNothing()) return;

		graph.fromJust().visit(visitingNodeID);

		const highlighCrossingEdges = (visitingNode, sourceNodesIDs: string[]) => {
			if (visitingNode == undefined || visitingNode.empty()) {
				console.warn(`Visiting node ${visitingNodeID} not found in Cytoscape`);
				return;
			}
			if (sourceNodesIDs.length == 0) return;

			if (!cy) return;

			const cutEdges = cy.edges('.crossing-cut');

			for (let i = 0; i < cutEdges.length; i++) {
				const edge = cutEdges[i];
				const source = edge.source();
				const sourceID = source.data('id');

				// Skip the visited nodes
				if (graph.fromJust().getNode(sourceID).visited) continue;

				edge.removeClass('crossing-cut');
			}

			const visitingNodeId = visitingNode.data('id');
			const visitingDL = graph.fromJust().getNode(visitingNodeId).dl;
			const visitingIndex =
				graph.fromJust().getNode(visitingNodeId)?.assignment?.index ?? Number.MAX_SAFE_INTEGER;

			for (const nodeId of sourceNodesIDs) {
				const node = cy.getElementById(nodeId);
				if (node.empty()) {
					console.warn(`Node ${nodeId} not found in Cytoscape`);
					return;
				}
				const outgoingEdges = node.outgoers('edge');

				const filterEdges = outgoingEdges.filter((edge) => {
					const target = edge.target();
					const data = target.data();
					const targetID = data['id'];
					const targetNode = graph.fromJust().getNode(targetID);
					const targetDL = targetNode.dl;
					const targetIndex = targetNode.assignment?.index ?? Number.MIN_SAFE_INTEGER;

					let targetIsFalsum = false;

					let targetIsAtLeastSameDL = false;
					let targetIndexIsBeyond = false;

					if (targetID == 'falsum') targetIsFalsum = true;

					if (visitingDL <= targetDL) targetIsAtLeastSameDL = true;
					if (targetIndex > visitingIndex) targetIndexIsBeyond = true;

					return targetIsFalsum || (targetIsAtLeastSameDL && targetIndexIsBeyond);
				});
				filterEdges.addClass('crossing-cut');
			}
		};

		// Highlight the visiting node
		const node = cy.getElementById(visitingNodeID);
		node.select();

		const computeSourceNodes = (): string[] => {
			if (graph.isNothing()) return [];
			if (conflictAnalysis.isNothing()) return [];
			return conflictAnalysis
				.fromJust()
				.getConflictiveClause()
				.getLiterals()
				.map((lit) => Literal.complementary(lit.toNumber()).toString());
		};

		const sourceNodes = computeSourceNodes();
		if (sourceNodes.length > 0) {
			highlighCrossingEdges(node, sourceNodes);
		}

		updateOverlayPositions();
	}

	function afterFinishingConflictAnalysis() {
		if (graph.isNothing()) return;

		if (conflictAnalysis.isNothing()) return;

		if (!cy) {
			logFatal('Implication Graph Error', 'There should be an implication graph created');
		}

		visitingNodeId = undefined;

		/*
		 * All the elements have crossed every cut
		 */
		for (const node of cy?.nodes() ?? []) {
			const outgoingEdges = node.outgoers('edge');
			outgoingEdges.addClass('crossing-cut');
		}
		// Update the positions of the overlay elements.
		updateOverlayPositions();
	}

	/*
	 * ------------------------------------------------------------------------
	 * Graph layout helpers
	 * ------------------------------------------------------------------------
	 */

	function calculateDepths(graph: ImplicationGraph): Map<string, number> {
		const depths = new Map<string, number>();

		function depth(nodeId: string): number {
			const cached = depths.get(nodeId);

			if (cached !== undefined) {
				return cached;
			}

			const incoming = graph.nodes().filter((source) => graph.edges(source).includes(nodeId));

			/*
			 * Should be the literals of the learned clause.
			 */
			if (incoming.length === 0) {
				depths.set(nodeId, 0);
				return 0;
			}

			const dl = graph.getNode(nodeId).dl;

			depths.set(nodeId, dl);

			return dl;
		}

		for (const nodeId of graph.nodes()) {
			depth(nodeId);
		}

		const inverseDepths = new Map<number, string[]>();

		for (const [nodeId, depth] of depths.entries()) {
			if (!inverseDepths.has(depth)) {
				inverseDepths.set(depth, []);
			}

			inverseDepths.get(depth)!.push(nodeId);
		}

		/*
		 * Prevent large gaps in the X axis.
		 */
		const normedDepths = new Map<string, number>();

		const dls: number[] = Array.from(inverseDepths.keys()).sort((a, b) => a - b);

		for (let d = 0; d < dls.length; d++) {
			const dl = dls[d];

			const nodesAtDepth = inverseDepths.get(dl)!;

			for (const nodeId of nodesAtDepth) {
				normedDepths.set(nodeId, d);
			}
		}

		return normedDepths;
	}

	function orderNodes(graph: ImplicationGraph): Map<string, number> {
		const depths = calculateDepths(graph);

		const groups = new Map<number, string[]>();

		for (const nodeId of graph.nodes()) {
			const depth = depths.get(nodeId)!;

			const group = groups.get(depth) ?? [];

			group.push(nodeId);

			groups.set(depth, group);
		}

		const order = new Map<string, number>();

		for (const nodes of groups.values()) {
			nodes.sort((a, b) => {
				const na = graph.getNode(a);
				const nb = graph.getNode(b);

				const ia = na.assignment?.index ?? Number.MAX_SAFE_INTEGER;

				const ib = nb.assignment?.index ?? Number.MAX_SAFE_INTEGER;

				return ia - ib;
			});

			nodes.forEach((nodeId, index) => {
				order.set(nodeId, index);
			});
		}

		return order;
	}

	function computeSlots(depths: Map<string, number>): Map<string, number> {
		// Group nodes by depth.
		const nodesByDepth = new Map<number, string[]>();

		for (const [nodeId, depth] of depths.entries()) {
			if (!nodesByDepth.has(depth)) {
				nodesByDepth.set(depth, []);
			}

			nodesByDepth.get(depth)!.push(nodeId);
		}

		// Mapping node -> slot.
		const slotMappings = new Map<string, number>();

		// Factors for slot allocation.
		const SCARCITY_FACTOR = 0.75;
		const LEMMA_FACTOR = 1;
		const SEED = 1000;

		for (const [depth, nodes] of nodesByDepth.entries()) {
			const factor = depth === 0 ? LEMMA_FACTOR : SCARCITY_FACTOR;

			const slots = Array.from(
				{
					length: Math.ceil(nodes.length * factor)
				},
				(_, i) => i
			);

			const random = mulberry32(SEED);

			// Shuffle slots randomly.
			for (let i = slots.length - 1; i > 0; i--) {
				const j = Math.floor(random() * (i + 1));

				[slots[i], slots[j]] = [slots[j], slots[i]];
			}

			// Assign slots to nodes.
			for (let i = 0; i < nodes.length; i++) {
				if (i < slots.length) {
					slotMappings.set(nodes[i], slots[i]);
				} else {
					const randomSlot = Math.floor(random() * slots.length);

					slotMappings.set(nodes[i], slots[randomSlot]);
				}
			}
		}

		return slotMappings;
	}

	/*
	 * ------------------------------------------------------------------------
	 * Cytoscape elements
	 * ------------------------------------------------------------------------
	 */

	function buildElements(graph: ImplicationGraph): ElementDefinition[] {
		const depths: Map<string, number> = calculateDepths(graph);
		const orders: Map<string, number> = orderNodes(graph);
		const slots: Map<string, number> = computeSlots(depths);

		const X_SPACING = 100;
		const Y_SPACING = 70;

		const positions = new Map<string, { x: number; y: number }>();

		for (const nodeId of graph.nodes()) {
			const depth = depths.get(nodeId)!;
			const order = orders.get(nodeId)!;
			const slot = slots.get(nodeId)!;

			const X_ORDER_SPACING = depth === 0 ? 0 : order * X_SPACING;

			positions.set(nodeId, {
				x: depth * X_SPACING + X_ORDER_SPACING,
				y: slot * Y_SPACING
			});
		}

		// Define the nodes and edges for Cytoscape.
		const elements: ElementDefinition[] = [];

		// Nodes definition
		for (const nodeId of graph.nodes()) {
			elements.push({
				group: 'nodes',

				data: {
					id: nodeId
				},

				position: positions.get(nodeId)
			});
		}

		// Edges definition (source -> target)
		for (const source of graph.nodes()) {
			for (const target of graph.edges(source)) {
				elements.push({
					group: 'edges',

					data: {
						id: `${source}->${target}`,
						source,
						target
					}
				});
			}
		}

		return elements;
	}

	// Create the Cytoscape graph and set up event listeners.
	function createGraph() {
		if (!container) return;

		if (graph.isNothing()) return;

		// Destroy whatever Cytoscape instance was previously created.
		cy?.destroy();

		const g: ImplicationGraph = graph.fromJust();

		const falsumId = g.falsumId();
		const uipIds = g.uipIds();
		const fuipId = g.fuipId();

		const FACTOR = 4;
		const [nodeWith, nodeHeight] = [10, 10].map(x => x * FACTOR);

		// Colors definition
		const booleanPropagationColor = getCssVariable(container, '--boolean-constraint-propagation');

		const inspectedColor = getCssVariable(container, '--inspecting-color');

		const satisfiedColor = getCssVariable(container, '--satisfied-color');

		const unsatisfiedColor = getCssVariable(container, '--unsatisfied-color');

		const satisfiedBackgroundColor = hex8ToRgba(
			getCssVariable(container, '--satisfied-border-color-o')
		);

		const visitedColor = getCssVariable(container, '--visited-color');

		// Edge width when the outgoing edges of the literals has passed the cut line (i.e., they are part of the conflict clause).
		const baseEdgeWidth = 2;
		const crossingOutEdgeWidth = 2;

		// Create the Cytoscape instance.
		cy = cytoscape({
			container,

			elements: buildElements(g),

			layout: {
				name: 'preset',
				fit: true,
				padding: 40
			},

			style: [
 				/*
 				 * ------------------------------------------------------------
 				 * Normal node
 				 *
 				 * Cytoscape keeps the node geometry, but Svelte renders
 				 * the visible content.
 				 * ------------------------------------------------------------
 				 */

 				{
 					selector: 'node',

 					style: {
 						shape: 'roundrectangle',

 						label: '',

 						'background-opacity': 0,

 						'border-width': 0,

 						width: nodeWith,
 						height: nodeHeight,
 					}
 				},

				/*
				 * ------------------------------------------------------------
				 * Edges
				 * ------------------------------------------------------------
				 */

				{
					selector: 'edge',

					style: {
						width: baseEdgeWidth,

						'line-color': visitedColor,

						'target-arrow-color': visitedColor,

						'target-arrow-shape': 'triangle',

						'curve-style': 'round-segments'
					}
				},
				{
					selector: '.crossing-cut',

					style: {
						'line-color': unsatisfiedColor,

						'target-arrow-color': unsatisfiedColor,

						width: crossingOutEdgeWidth
					}
				}
			],

			minZoom: 0.2,
			maxZoom: 3,

			wheelSensitivity: 0.2,

			boxSelectionEnabled: false,

			autoungrabify: false
		});


		// Initial overlay positions
		updateOverlayPositions();

		// --------------------------------------------------------------------
		// Keep Svelte components synchronized with Cytoscape.
		//
		// render -> repaint
		// pan    -> pan
		// zoom   -> zoom
		// position -> layout / node movement
		// --------------------------------------------------------------------
		cy.on('render pan zoom position', () => {
			updateOverlayPositions();
		});

		// --------------------------------------------------------------------
		// Node click
		// --------------------------------------------------------------------
		cy.on('tap', 'node', (event) => {
			console.debug(`ImplicationGraphComponent: Node ${event.target.id()} clicked`);
		});

		// --------------------------------------------------------------------
		// Fit graph when clicking on empty space
		// --------------------------------------------------------------------
		cy.on('dbltap', (event) => {
			if (event.target === cy) {
				fitGraph();
			}
		});

		// --------------------------------------------------------------------
		// Double click -> center/zoom around node
		// --------------------------------------------------------------------
		cy.on('dbltap', 'node', (event) => {
			const node = event.target;

			cy!.animate({
				fit: {
					eles: node,
					padding: 256
				},

				duration: 300
			});
		});

		// Make sure the overlay positions are updated after the layout is finished.
		requestAnimationFrame(() => {
			updateOverlayPositions();
		});
	}

	// Fit the graph to the viewport, keeping all nodes visible.
	function fitGraph() {
		if (!cy) return;

		cy.animate({
			fit: {
				eles: cy.elements(),

				padding: 40
			},

			duration: 300
		});
	}

	function zoomIn() {
		if (!cy) return;

		cy.zoom({
			level: cy.zoom() * 1.2,

			renderedPosition: {
				x: container.clientWidth / 2,

				y: container.clientHeight / 2
			}
		});

		updateOverlayPositions();
	}

	function zoomOut() {
		if (!cy) return;

		cy.zoom({
			level: cy.zoom() / 1.2,

			renderedPosition: {
				x: container.clientWidth / 2,

				y: container.clientHeight / 2
			}
		});

		updateOverlayPositions();
	}

	/*
	 * ------------------------------------------------------------------------
	 * Mount / destroy
	 * ------------------------------------------------------------------------
	 */

	function resizeGraph() {
		console.debug('ImplicationGraphComponent: toolPanelResizedEventBus received');
		if (graph.isNothing()) return;
		createGraph();
		fitGraph();
	}

	onMount(() => {
		// When the view is created, a graph should be created as well
		createGraph();

		const subs: (() => void)[] = [];
		//If, for some reason the view is opened and a conflict is found, create a new graph
		// COMMENT: I think that in the future this should be changed into creating the graph of the opened ca view.
		subs.push(updatedImplicationGraph.subscribe(createGraph));
		subs.push(toolPanelResizedEventBus.subscribe(resizeGraph));

		return () => {
			cy?.destroy();
			cy = undefined;
			overlayNodes = [];

			// Unsubscribe
			subs.forEach((s) => s());
		};
	});

	/*
	 * ------------------------------------------------------------------------
	 * React to the current implication.
	 * ------------------------------------------------------------------------
	 */

	$effect(() => {
		if (graph.isNothing()) {
			cy?.destroy();

			cy = undefined;

			overlayNodes = [];

			return;
		}

		if (pivotingVariableAssignment.isJust()) {
			visitingNodeId = pivotingVariableAssignment.fromJust().toString();
			visitNode(visitingNodeId);
		}

		if (conflictAnalysis.isJust() && conflictAnalysis.fromJust().finished()) {
			afterFinishingConflictAnalysis();
		}
	});
</script>

<div class="graph-wrapper">
	<!--
		Toolbar
	-->

	<div class="toolbar">
		<button class="btn" onclick={zoomIn}> + </button>

		<button class="btn" onclick={zoomOut}> − </button>

		{#if visitingNodeId}
			<span class="selected">
				Inspecting:
				<strong>{visitingNodeId}</strong>
			</span>
		{/if}
	</div>

	<!--
		Cytoscape + Svelte overlay
	-->

	<div class="graph-layer">
		<!--
			Cytoscape owns the graph, edges, positions, zoom, etc.
		-->

		<div bind:this={container} class="graph"></div>

		<!--
			Svelte owns the visual representation of the nodes.
		-->

		<div class="node-overlay">
			{#each overlayNodes as node (node.id)}
				{@const Component = node.component}

				<div class="node-component" style={`left: ${node.x}px; top: ${node.y}px;`}>
					<Component {...node.props} />
				</div>

				<!-- The cut line at the right of the node -->
				{#if node.id === visitingNodeId}
					<div class="cut-line" style={`left: ${node.x}px;`}></div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.graph-wrapper {
		position: relative;

		width: 100%;
		height: 100%;

		min-height: 500px;

		overflow: hidden;

		background: #f8fafc;
	}

	/*
	 * Wrapper containing both the Cytoscape canvas and
	 * the Svelte overlay.
	 */

	.graph-layer {
		position: absolute;

		inset: 0;
	}

	.graph {
		position: absolute;

		inset: 0;

		width: 100%;
		height: 100%;
	}

	/*
	 * Svelte components are positioned on top of Cytoscape.
	 */

	.node-overlay {
		position: absolute;

		inset: 0;

		z-index: 5;

		/*
		 * Important:
		 *
		 * Don't block Cytoscape mouse events.
		 */

		pointer-events: none;
	}

	.node-component {
		position: absolute;

		/*
		 * Cytoscape's renderedPosition() represents the center
		 * of the node.
		 */

		transform: translate(-50%, -50%);

		/*
		 * Keep Cytoscape responsible for clicks/selections.
		 */

		pointer-events: none;
	}

	.toolbar {
		position: absolute;

		z-index: 10;

		top: 12px;
		left: 12px;

		display: flex;

		align-items: center;

		gap: 6px;

		padding: 8px;

		background: var(--main-bg-color);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

		border-color: var(--button-border-color);
		border-style: solid;
		border-width: 1px;
		border-radius: 6px;
	}

	button {
		height: var(--button-size) / 1.5;
		width: var(--button-size) / 1.5;
		min-width: fit-content;
		padding: 0.5rem 0.75rem;

		border-color: var(--button-border-color);
		border-style: solid;
		border-width: 1px;
		border-radius: 6px;

		align-items: center;
		justify-content: center;

		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		background-color: var(--button-color);

		cursor: pointer;
	}

	button:hover {
		background-color: var(--button-hover-color);
	}

	button:active {
		background-color: var(--button-color);
	}

	.selected {
		margin-left: 8px;

		padding-left: 10px;

		border-left: 1px solid var(--button-border-color);

		font-size: 13px;
	}

	.cut-line {
		position: absolute;

		top: 0;
		bottom: 0;

		width: 0;

		border-left: 1px dashed var(--visited-color);

		transform: translateX(20px);

		pointer-events: none;
		z-index: 1;
	}

	.dl-line {
		position: absolute;

		top: 0;
		bottom: 0;

		width: 0;

		border-left: 1px dashed rgba(0, 0, 0, 0.1);

		transform: translateX(-20px);

		pointer-events: none;
		z-index: 1;
	}
</style>
