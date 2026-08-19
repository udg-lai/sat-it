<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from 'cytoscape';
	import dagre from 'cytoscape-dagre';

	import {
		getImplicationGraph,
		type ImplicationGraph
	} from '$lib/entities/ImplicationGraph.svelte.ts';

	import { getCssVariable, hex8ToRgba, mulberry32 } from '$lib/utils.ts';

	import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';

	import PropagationNode from './nodes/PropagationNodeComponent.svelte';
	import DecisionNode from './nodes/DecisionNodeComponent.svelte';
	import ConflictNode from './nodes/ConflictNodeComponent.svelte';

	import type { ConflictAnalysis } from '$lib/entities/ConflictAnalysis.svelte.ts';
	import { obtainConflictAnalysis } from '$lib/states/conflict-analysis.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';

	/*
	 * Svelte components that will be rendered inside the Cytoscape nodes.
	 *
	 * Change these imports to your actual components.
	 */

	cytoscape.use(dagre);

	let container: HTMLDivElement;
	let cy: Core | undefined;

	let inspectingNode: string | undefined = $state(undefined);

	let graph: Maybe<ImplicationGraph> = $derived(getImplicationGraph());

	let ca: Maybe<VariableAssignment> = $derived.by(() => {
		if (graph.isNothing()) return makeNothing();

		const ca: Maybe<ConflictAnalysis> = obtainConflictAnalysis();

		if (ca.isNothing()) return makeNothing();

		const conflictAnalysis: ConflictAnalysis = ca.fromJust();

		if (conflictAnalysis.finished()) return makeNothing();

		return makeJust(conflictAnalysis.currentImplication());
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

	/*
	 * Update the Svelte overlay so that every component follows
	 * the actual rendered Cytoscape position.
	 */
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
					selected: node.selected()
				}
			};
		});
	}

	/*
	 * ------------------------------------------------------------------------
	 * Selection
	 * ------------------------------------------------------------------------
	 */

	function selectNode(nodeId: string) {
		if (!cy) return;

		inspectingNode = nodeId;

		/*
		 * Clear previous highlighting.
		 */
		cy.elements().removeClass('highlighted');

		/*
		 * Clear previous selection.
		 */
		cy.nodes().unselect();

		/*
		 * Get node.
		 */
		const node = cy.getElementById(nodeId);

		if (node.empty()) {
			console.warn(`Node ${nodeId} not found in Cytoscape`);
			return;
		}

		/*
		 * Select Cytoscape node.
		 */
		node.select();

		/*
		 * Highlight only incoming edges.
		 */
		const incomingEdges = node.incomers('edge');

		incomingEdges.addClass('highlighted');

		/*
		 * Update Svelte components.
		 */
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
		/*
		 * Group nodes by depth.
		 */
		const nodesByDepth = new Map<number, string[]>();

		for (const [nodeId, depth] of depths.entries()) {
			if (!nodesByDepth.has(depth)) {
				nodesByDepth.set(depth, []);
			}

			nodesByDepth.get(depth)!.push(nodeId);
		}

		/*
		 * Mapping node -> slot.
		 */
		const slotMappings = new Map<string, number>();

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

			/*
			 * Shuffle slots randomly.
			 */
			for (let i = slots.length - 1; i > 0; i--) {
				const j = Math.floor(random() * (i + 1));

				[slots[i], slots[j]] = [slots[j], slots[i]];
			}

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
		const depths = calculateDepths(graph);
		const orders = orderNodes(graph);
		const slots = computeSlots(depths);

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

		const elements: ElementDefinition[] = [];

		/*
		 * --------------------------------------------------------------------
		 * Nodes
		 * --------------------------------------------------------------------
		 */

		for (const nodeId of graph.nodes()) {
			elements.push({
				group: 'nodes',

				data: {
					id: nodeId
				},

				position: positions.get(nodeId)
			});
		}

		/*
		 * --------------------------------------------------------------------
		 * Edges
		 *
		 * source -> target
		 * --------------------------------------------------------------------
		 */

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

	/*
	 * ------------------------------------------------------------------------
	 * Create Cytoscape
	 * ------------------------------------------------------------------------
	 */

	function createGraph() {
		if (!container) return;

		if (graph.isNothing()) return;

		/*
		 * Destroy old graph if necessary.
		 */
		cy?.destroy();

		const graphValue = graph.fromJust();

		const falsumId = graphValue.falsumId();
		const uipIds = graphValue.uipIds();
		const fuipId = graphValue.fuipId();

		const [w, h] = [30, 30];

		/*
		 * --------------------------------------------------------------------
		 * Colors
		 * --------------------------------------------------------------------
		 */

		const booleanPropagationColor = getCssVariable(container, '--boolean-constraint-propagation');

		const inspectedColor = getCssVariable(container, '--inspecting-color');

		const satisfiedColor = getCssVariable(container, '--satisfied-color');

		const satisfiedBackgroundColor = hex8ToRgba(
			getCssVariable(container, '--satisfied-border-color-o')
		);

		const visitedColor = getCssVariable(container, '--visited-color');

		/*
		 * --------------------------------------------------------------------
		 * Shape widths
		 * --------------------------------------------------------------------
		 */

		const inspectingBorderWidth = 2;

		/*
		 * --------------------------------------------------------------------
		 * Cytoscape
		 * --------------------------------------------------------------------
		 */

		cy = cytoscape({
			container,

			elements: buildElements(graphValue),

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

						width: w,
						height: h
					}
				},

				/*
				 * ------------------------------------------------------------
				 * Falsum / conflict node
				 * ------------------------------------------------------------
				 */

				{
					selector: `node[id = "${falsumId}"]`,

					style: {
						width: w,
						height: h,

						label: '',

						'background-opacity': 0,

						'border-width': 0
					}
				},

				/*
				 * ------------------------------------------------------------
				 * UIP nodes
				 * ------------------------------------------------------------
				 */

				{
					selector: Array.from(uipIds.values()).map((id) => `node[id = "${id}"]`).join(', '),

					style: {
						width: w,
						height: h,

						label: '',

						'background-opacity': 0,

						'border-width': 0
					}
				},

				/*
				 * ------------------------------------------------------------
				 * FUIP node
				 * ------------------------------------------------------------
				 */

				{
					selector: `node[id = "${fuipId}"]`,

					style: {
						width: w,
						height: h,

						label: '',

						'background-opacity': 0,

						'border-width': 0
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
						width: 2,

						'line-color': visitedColor,

						'target-arrow-color': visitedColor,

						'target-arrow-shape': 'triangle',

						'curve-style': 'round-segments'
					}
				},

				/*
				 * ------------------------------------------------------------
				 * Selected node
				 *
				 * We don't visually style the node because the Svelte
				 * component itself is responsible for rendering selection.
				 *
				 * ------------------------------------------------------------
				 */

				{
					selector: 'node:selected',

					style: {
						'border-width': 0
					}
				},

				/*
				 * ------------------------------------------------------------
				 * Highlighted incoming edges
				 * ------------------------------------------------------------
				 */

				{
					selector: '.highlighted',

					style: {
						'line-color': inspectedColor,

						'target-arrow-color': inspectedColor,

						width: inspectingBorderWidth
					}
				}
			],

			minZoom: 0.2,
			maxZoom: 3,

			wheelSensitivity: 0.2,

			boxSelectionEnabled: false,

			autoungrabify: false
		});

		/*
		 * --------------------------------------------------------------------
		 * Initial overlay position
		 * --------------------------------------------------------------------
		 */

		updateOverlayPositions();

		/*
		 * --------------------------------------------------------------------
		 * Keep Svelte components synchronized with Cytoscape.
		 *
		 * render -> repaint
		 * pan    -> pan
		 * zoom   -> zoom
		 * position -> layout / node movement
		 * --------------------------------------------------------------------
		 */

		cy.on('render pan zoom position', () => {
			updateOverlayPositions();
		});

		/*
		 * --------------------------------------------------------------------
		 * Node click
		 * --------------------------------------------------------------------
		 */

		cy.on('tap', 'node', (event) => {
			const node: NodeSingular = event.target;

			console.debug('Node', node);

			selectNode(node.id());
		});

		/*
		 * --------------------------------------------------------------------
		 * Click empty space
		 * --------------------------------------------------------------------
		 */

		cy.on('tap', (event) => {
			if (event.target === cy) {
				inspectingNode = undefined;

				cy!.elements().removeClass('highlighted');

				cy!.nodes().unselect();

				updateOverlayPositions();
			}
		});

		/*
		 * --------------------------------------------------------------------
		 * Double click -> center/zoom around node
		 * --------------------------------------------------------------------
		 */

		cy.on('dbltap', 'node', (event) => {
			const node = event.target;

			cy!.animate({
				fit: {
					eles: node,
					padding: 120
				},

				duration: 300
			});
		});

		/*
		 * --------------------------------------------------------------------
		 * Make sure positions are correct after the initial layout.
		 * --------------------------------------------------------------------
		 */

		requestAnimationFrame(() => {
			updateOverlayPositions();
		});
	}

	/*
	 * ------------------------------------------------------------------------
	 * Controls
	 * ------------------------------------------------------------------------
	 */

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

	function resetLayout() {
		if (!cy) return;

		cy.layout({
			name: 'dagre',

			rankDir: 'LR',

			nodeSep: 60,

			rankSep: 100,

			edgeSep: 30,

			padding: 40,

			animate: true,

			animationDuration: 300
		}).run();

		setTimeout(() => {
			updateOverlayPositions();
		}, 350);
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

	onMount(() => {
		createGraph();

		return () => {
			cy?.destroy();

			cy = undefined;

			overlayNodes = [];
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

		if (ca.isJust()) {
			inspectingNode = ca.fromJust().toString();

			selectNode(inspectingNode);
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

		<button class="btn" onclick={fitGraph}> Fit </button>

		<button class="btn" onclick={resetLayout}> Layout </button>

		{#if inspectingNode}
			<span class="selected">
				Inspecting:
				<strong>{inspectingNode}</strong>
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

	/*
	 * Toolbar must be above everything.
	 */

	.toolbar {
		position: absolute;

		z-index: 20;

		top: 12px;
		left: 12px;

		display: flex;

		align-items: center;

		gap: 6px;

		padding: 8px;

		background: rgba(255, 255, 255, 0.95);

		border: 1px solid #e2e8f0;

		border-radius: 8px;

		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	button {
		min-width: 30px;

		width: fit-content;

		height: 30px;

		padding: 0.5rem 0.75rem;

		border: 1px solid #cbd5e1;

		border-radius: 6px;

		background: white;

		cursor: pointer;
	}

	button:hover {
		background: #f1f5f9;
	}

	.selected {
		margin-left: 8px;

		padding-left: 10px;

		border-left: 1px solid #e2e8f0;

		font-size: 13px;
	}
</style>
