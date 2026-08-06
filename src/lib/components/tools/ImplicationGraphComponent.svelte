<script lang="ts">
	// 	import { getImplicationGraph, type IG_Node, type IG_Edge } from '$lib/entities/ImplicationGraph.svelte.ts';
	//
	// 	import ELK from 'elkjs/lib/elk.bundled.js';
	//
	// 	import * as d3 from 'd3';
	//
	// 	import { onMount } from 'svelte';
	//
	//
	//
	// 	const maybeImplicationGraph = $derived(getImplicationGraph());
	//
	// 	const ElkConstructor = ELK as unknown as {
	//
	// 		new (): {
	//
	// 			layout: (graph: any) => Promise<any>;
	//
	// 		};
	//
	// 	};
	//
	// 	const elk = new ElkConstructor();
	//
	// 	const elkInstance = elk as {
	//
	// 		layout: (graph: any) => Promise<any>;
	//
	// 	};
	//
	//
	//
	// 	let nodes: IG_Node[] = $derived.by(() => {
	//
	// 		if (maybeImplicationGraph.isJust()) {
	//
	// 			const implicationGraph = maybeImplicationGraph.fromJust();
	//
	// 			return implicationGraph.nodes();
	//
	// 		}
	//
	// 		return [];
	//
	// 	});
	//
	//
	//
	// 	let edges: IG_Edge[] = $derived.by(() => {
	//
	// 		if (maybeImplicationGraph.isJust()) {
	//
	// 			const implicationGraph = maybeImplicationGraph.fromJust();
	//
	// 			return implicationGraph.edges();
	//
	// 		}
	//
	// 		return [];
	//
	// 	});
	//
	//
	//
	// 	type LayoutNode = IG_Node & { x: number; y: number; width: number; height: number };
	//
	//
	//
	// 	let layout: LayoutNode[] = $state([]);
	//
	// 	let edgePaths: string[] = $state([]);
	//
	// 	let layoutRunId = 0;
	//
	//
	//
	//
	//
	// 	let svg: SVGSVGElement;
	//
	// 	let graphLayer: any;
	//
	//
	//
	// 	const width = 1200;
	//
	// 	let height = $state(700);
	//
	//
	//
	// 	function edgePathFromSections(edge: { sections?: Array<{ startPoint: { x: number; y: number }; endPoint: { x: number; y: number }; bendPoints?: Array<{ x: number; y: number }> }> }): string {
	//
	// 		const section = edge.sections?.[0];
	//
	//
	//
	// 		if (!section) return '';
	//
	//
	//
	// 		const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
	//
	// 		return points.reduce((path, point, index) => {
	//
	// 			return `${path}${index === 0 ? 'M' : 'L'} ${point.x} ${point.y} `;
	//
	// 		}, '').trim();
	//
	// 	}
	//
	//
	//
	// 	async function updateLayout(): Promise<void> {
	//
	// 		const runId = ++layoutRunId;
	//
	//
	//
	// 		if (nodes.length === 0) {
	//
	// 			layout = [];
	//
	// 			edgePaths = [];
	//
	// 			return;
	//
	// 		}
	//
	//
	//
	// 		const dlGroups: Map<number, IG_Node[]> = new Map();
	//
	//
	//
	// 		for (const n of nodes) {
	//
	// 			if (!dlGroups.has(n.dl)) dlGroups.set(n.dl, []);
	//
	// 			dlGroups.get(n.dl)?.push(n);
	//
	//
	//
	// 		}
	//
	//
	//
	// 		function sortNodes(nodes: IG_Node[]): void {
	//
	// 			nodes.sort((a, b) => {
	//
	// 				if (a.index === undefined) {
	//
	// 					return 1;
	//
	// 				}
	//
	// 				if (b.index === undefined) {
	//
	// 					return -1;
	//
	// 				}
	//
	// 				return a.index - b.index;
	//
	// 			});
	//
	// 		}
	//
	//
	//
	// 		// Sort inner groups by index
	//
	// 		for (const group of dlGroups.values()) {
	//
	// 			sortNodes(group);
	//
	// 		}
	//
	//
	//
	// 		const levels: number[] = Array.from(dlGroups.keys()).sort((a, b) => a - b);
	//
	// 		const levelIndexByNodeId = new Map<string, number>();
	//
	// 		for (const [levelIndex, dl] of levels.entries()) {
	//
	// 			const group = dlGroups.get(dl) ?? [];
	//
	// 			for (const node of group) {
	//
	// 				levelIndexByNodeId.set(node.id, node.id === 'falsum' ? levels.length : levelIndex);
	//
	// 			}
	//
	// 		}
	//
	//
	//
	// 		const inLayerPredecessorByNodeId = new Map<string, string>();
	//
	// 		for (const dl of levels) {
	//
	// 			const group = dlGroups.get(dl) ?? [];
	//
	// 			for (let i = 1; i < group.length; i++) {
	//
	// 				inLayerPredecessorByNodeId.set(group[i].id, group[i - 1].id);
	//
	// 			}
	//
	// 		}
	//
	//
	//
	// 		const elkGraph = {
	//
	// 			id: 'root',
	//
	// 			layoutOptions: {
	//
	// 				'elk.algorithm': 'layered',
	//
	// 				'elk.direction': 'RIGHT',
	//
	// 				'elk.edgeRouting': 'SPLINES',
	//
	// 				'elk.spacing.nodeNode': '30',
	//
	// 				'elk.layered.spacing.nodeNodeBetweenLayers': '80',
	//
	// 				'elk.layered.edgeRouting.splines.mode': 'SLOPPY',
	//
	// 				'elk.layered.edgeRouting.splines.sloppy.layerSpacingFactor': '0.3',
	//
	// 				'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
	//
	// 				'elk.layered.crossingMinimization.semiInteractive': 'true',
	//
	// 				'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
	//
	// 				'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
	//
	// 				'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
	//
	// 				'elk.layered.layering.strategy': 'NETWORK_SIMPLEX'
	//
	// 			},
	//
	// 			children: [...nodes]
	//
	// 				.sort((a, b) => {
	//
	// 					if (a.dl !== b.dl) return a.dl - b.dl;
	//
	// 					if (a.index === undefined) return 1;
	//
	// 					if (b.index === undefined) return -1;
	//
	// 					return a.index - b.index;
	//
	// 				})
	//
	// 				.map((node) => ({
	//
	// 					id: node.id,
	//
	// 					width: 56,
	//
	// 					height: 56,
	//
	// 					layoutOptions: {
	//
	// 						layerId: String(levelIndexByNodeId.get(node.id) ?? 0),
	//
	// 						positionId: String(node.index ?? Number.MAX_SAFE_INTEGER),
	//
	// 						...(inLayerPredecessorByNodeId.has(node.id)
	//
	// 							? {
	//
	// 								'org.eclipse.elk.layered.crossingMinimization.inLayerPredOf':
	//
	// 									inLayerPredecessorByNodeId.get(node.id)
	//
	// 							}
	//
	// 							: {})
	//
	// 					}
	//
	// 				})),
	//
	// 			edges: edges.map((edge, index) => ({
	//
	// 				id: `e-${index}`,
	//
	// 				sources: [edge.from.id],
	//
	// 				targets: [edge.to.id]
	//
	// 			}))
	//
	// 		};
	//
	//
	//
	// 		const result = await elkInstance.layout(elkGraph);
	//
	// 		if (runId !== layoutRunId) return;
	//
	//
	//
	// 		const nextLayout = (result.children ?? []).map((child: any) => {
	//
	// 			const original = nodes.find((node) => node.id === child.id);
	//
	// 			return {
	//
	// 				...(original as IG_Node),
	//
	// 				x: (child.x ?? 0) + (child.width ?? 56) / 2,
	//
	// 				y: (child.y ?? 0) + (child.height ?? 56) / 2,
	//
	// 				width: child.width ?? 56,
	//
	// 				height: child.height ?? 56
	//
	// 			};
	//
	// 		});
	//
	//
	//
	// 		layout = nextLayout;
	//
	// 		edgePaths = (result.edges ?? []).map((edge: any) => {
	//
	// 			const sections = edge.sections ?? [];
	//
	// 			if (sections.length > 0) {
	//
	// 				return edgePathFromSections({ sections: sections as any });
	//
	// 			}
	//
	//
	//
	// 			const source = nextLayout.find((node: LayoutNode) => node.id === edge.sources?.[0]);
	//
	// 			const target = nextLayout.find((node: LayoutNode) => node.id === edge.targets?.[0]);
	//
	// 			if (!source || !target) return '';
	//
	// 			return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
	//
	// 		});
	//
	//
	//
	// 		renderGraph();
	//
	// 	}
	//
	//
	//
	// 	function renderGraph(): void {
	//
	// 		if (!graphLayer) return;
	//
	//
	//
	// 		graphLayer.selectAll('*').remove();
	//
	//
	//
	// 		graphLayer
	//
	// 			.selectAll('path.edge')
	//
	// 			.data(edgePaths)
	//
	// 			.join('path')
	//
	// 			.attr('d', (d: string) => d)
	//
	// 			.attr('stroke', '#777')
	//
	// 			.attr('stroke-width', 2)
	//
	// 			.attr('fill', 'none')
	//
	// 			.attr('stroke-linecap', 'round');
	//
	//
	//
	// 		const node = graphLayer
	//
	// 			.selectAll('g.node')
	//
	// 			.data(layout)
	//
	// 			.join('g')
	//
	// 			.attr('transform', (d: LayoutNode) => `translate(${d.x},${d.y})`);
	//
	//
	//
	// 		node
	//
	// 			.append('circle')
	//
	// 			.attr('r', 28)
	//
	// 			.attr('fill', (d: LayoutNode) => (d.id === 'falsum' ? '#ffdddd' : '#ddd'));
	//
	//
	//
	// 		node
	//
	// 			.append('text')
	//
	// 			.text((d: LayoutNode) => d.id)
	//
	// 			.attr('text-anchor', 'middle')
	//
	// 			.attr('dy', 5);
	//
	// 	}
	//
	//
	//
	// 	$effect(() => {
	//
	// 		layout;
	//
	// 		edges;
	//
	//
	//
	// 		void updateLayout();
	//
	// 	});
	//
	//
	//
	//
	//
	// 	onMount(() => {
	//
	// 		const updateHeight = () => {
	//
	// 			height = window.innerHeight;
	//
	// 		};
	//
	//
	//
	// 		updateHeight();
	//
	// 		window.addEventListener('resize', updateHeight);
	//
	//
	//
	// 		const root = d3.select(svg);
	//
	// 		root.selectAll('*').remove();
	//
	//
	//
	// 		graphLayer = root.append('g');
	//
	//
	//
	// 		root.call(
	//
	// 			d3.zoom().on('zoom', (e: any) => {
	//
	// 				graphLayer.attr('transform', e.transform);
	//
	// 			})
	//
	// 		);
	//
	//
	//
	// 		renderGraph();
	//
	//
	//
	// 		return () => {
	//
	// 			window.removeEventListener('resize', updateHeight);
	//
	// 		};
	//
	// 	});
	//
</script>

<!--
<svg bind:this={svg} {width} {height} />
-->
