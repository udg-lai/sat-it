<script lang="ts">
	import { onMount } from 'svelte';
	import cytoscape, { type Core, type ElementDefinition } from 'cytoscape';
	import dagre from 'cytoscape-dagre';
	import { getImplicationGraph, ImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
	import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
	import type { ConflictAnalysis } from '$lib/entities/ConflictAnalysis.svelte.ts';
	import {
		obtainConflictAnalysis
	} from '$lib/states/conflict-analysis.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';

	import { getCssVariable } from '$lib/utils.ts';

	cytoscape.use(dagre);

	let container: HTMLDivElement;
	let cy: Core | undefined;

	let selectedNode: string | undefined = $state(undefined);

	let graph: Maybe<ImplicationGraph> = $derived(getImplicationGraph());

	let ca: Maybe<VariableAssignment> = $derived.by(() => {
		if (graph.isNothing()) return makeNothing();
		const ca: Maybe<ConflictAnalysis> = obtainConflictAnalysis();
		if (ca.isNothing()) return makeNothing();
		const conflictAnalysis: ConflictAnalysis = ca.fromJust();
		if (conflictAnalysis.finished()) return makeNothing();
		return makeJust(conflictAnalysis.currentImplication());
	});

	$effect(() => {
		if (ca.isJust()) {
			selectedNode = ca.fromJust().toString();
			selectNode(selectedNode);
		}
	});

	function selectNode(nodeId: string) {
		if (!cy) return;

		selectedNode = nodeId;

		// Clear previous highlighting
		cy.elements().removeClass('highlighted');

		cy.nodes().unselect();

		// Select the Cytoscape node
		const node = cy.getElementById(nodeId);

		if (node.empty()) {
			console.warn(`Node ${nodeId} not found in Cytoscape`);
			return;
		}

		// This adds the .selected class
		node.select();

		// Highlight incoming/outgoing edges
		node.connectedEdges().addClass('highlighted');
	}

	function buildElements(graph: ImplicationGraph): ElementDefinition[] {
		const elements: ElementDefinition[] = [];

		/*
		 * Nodes
		 */
		for (const nodeId of graph.nodes()) {
			elements.push({
				group: 'nodes',
				data: {
					id: nodeId,
					label: nodeId
				}
			});
		}

		/*
		 * Edges
		 *
		 * Your _edges map is:
		 *
		 *   source -> [target1, target2, ...]
		 *
		 * So for every source node we create one Cytoscape edge
		 * for each target.
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

	function createGraph() {
		if (!container) return;

		if (graph.isNothing()) return;

		// In case this function is called again.
		cy?.destroy();

		const falsumId = graph.fromJust().falsumId();
		const uipIds = graph.fromJust().uipIds()
		const fuipId = graph.fromJust().fuipId();

		const [w, h] = [40, 40];

		// Colors
		const booleanPropagationColor = getCssVariable(container, '--boolean-constraint-propagation');
		const inspectedColor = getCssVariable(container, '--inspecting-color');
		const inspectingBorderWidth = 4;
		const baseBorderWidth = 2;

		cy = cytoscape({
			container,

			elements: buildElements(graph.fromJust()),

			layout: {
				name: 'dagre',
				rankDir: 'LR',
				nodeSep: 60,
				rankSep: 100,
				edgeSep: 30,
				padding: 40
			},

			style: [
				/*
				 * Normal node
				 */
				{
					selector: 'node',
					style: {
						shape: 'roundrectangle',

						label: 'data(label)',

						'text-valign': 'center',
						'text-halign': 'center',

						'font-size': 14,
						'font-weight': 500,

						'background-color': '#ffffff',

						'border-width': baseBorderWidth,
						'border-color': inspectedColor,

						width: w,
						height: h,

						'padding-left': 16,
						'padding-right': 16
					}
				},

				/*
				 * Falsum / conflict node
				 */
				{
					selector: `node[id = "${falsumId}"]`,
					style: {
						shape: 'ellipse',

						label: '⊥',

						'background-color': '#fee2e2',
						'border-color': '#dc2626',
						'border-width': baseBorderWidth,

						'font-size': 24,
						'font-weight': 'bold',

						width: w,
						height: h
					}
				},


				/*
				 * UIP nodes
				 */
				{
					selector: uipIds.map((id) => `node[id = "${id}"]`).join(', '),
					style: {
						shape: 'heptagon',

						label: 'data(label)',

						'text-valign': 'center',
						'text-halign': 'center',

						'font-size': 14,
						'font-weight': 500,

						'background-color': '#ffffff',

						'border-width': baseBorderWidth,
						'border-color': '#444',

						width: w,
						height: h
					}
				},


				/*
				 * FUIP nodes
				 */
				{
					selector: `node[id = "${fuipId}"]`,
					style: {
						shape: 'heptagon',

						label: 'data(label)',

						'background-color': '#fee2e2',
						'border-color': booleanPropagationColor,
						'border-width': baseBorderWidth,

						'font-size': 14,
						'font-weight': 500,

						width: w,
						height: h
					}
				},

				/*
				 * Edges
				 */
				{
					selector: 'edge',
					style: {
						width: 2,

						'line-color': '#64748b',

						'target-arrow-color': '#64748b',
						'target-arrow-shape': 'triangle',

						'curve-style': 'bezier'
					}
				},

				/*
				 * Selected node
				 */
				{
					selector: 'node:selected',
					style: {
						'border-color': inspectedColor,
						'border-width': inspectingBorderWidth,
					}
				},

				/*
				 * Highlighted edges
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

			/*
			 * General interaction settings
			 */
			minZoom: 0.2,
			maxZoom: 3,

			wheelSensitivity: 0.2,

			boxSelectionEnabled: false,

			/*
			 * Disable automatic node movement if you only want
			 * to use the Dagre layout.
			 *
			 * Set this to true if you want users to rearrange nodes.
			 */
			autoungrabify: false
		});

		/*
		 * Node click
		 */
		cy.on('tap', 'node', (event) => {
			const node = event.target;

			console.debug('Node', node);

			selectNode(node.id());
		});

		/*
		 * Click empty space
		 */
		cy.on('tap', (event) => {
			if (event.target === cy) {
				selectedNode = undefined;

				cy!.elements().removeClass('highlighted');

				cy!.nodes().unselect();
			}
		});

		/*
		 * Double click -> center/zoom around node
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
	}

	function fitGraph() {
		cy?.animate({
			fit: {
				eles: cy.elements(),
				padding: 40
			},
			duration: 300
		});
	}

	function resetLayout() {
		cy?.layout({
			name: 'dagre',
			rankDir: 'LR',
			nodeSep: 60,
			rankSep: 100,
			edgeSep: 30,
			padding: 40,
			animate: true,
			animationDuration: 300
		}).run();
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
	}

	onMount(() => {
		createGraph();

		return () => {
			cy?.destroy();
		};
	});

</script>

<div class={`graph-wrapper`}>
	<div class="toolbar">
		<button onclick={zoomIn}>+</button>
		<button onclick={zoomOut}>−</button>
		<button onclick={fitGraph}>Fit</button>
		<button onclick={resetLayout}>Layout</button>

		{#if selectedNode}
			<span class="selected">
				Selected: <strong>{selectedNode}</strong>
			</span>
		{/if}
	</div>

	<div bind:this={container} class="graph"></div>
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

	.graph {
		width: 100%;
		height: 100%;
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

		background: rgba(255, 255, 255, 0.95);
		border: 1px solid #e2e8f0;
		border-radius: 8px;

		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	button {
		width: 34px;
		height: 30px;

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
