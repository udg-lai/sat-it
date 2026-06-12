<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Sigma from 'sigma';
	import { bindWebGLLayer, createContoursProgram } from '@sigma/layer-webgl';
	import { EdgeArrowProgram } from 'sigma/rendering';
	import type { EdgeProgramType, NodeLabelDrawingFunction } from 'sigma/rendering';
	import type { Settings } from 'sigma/settings';
	import { ImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
	import { resolutionStepEventBus } from '$lib/events/events.ts';
	import { getFocusedTrail } from '$lib/states/trails.svelte.ts';

	type NodeGroup = 'conflict' | 'decision' | 'propagation' | 'conflictReason' | 'learned';
	type SigmaGraph = ReturnType<ImplicationGraph['toSigmaDirectedGraph']>;
	type NodeLabelParameters = Parameters<NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes>>;

	type NodeAttributes = {
		label: string;
		x: number;
		y: number;
		size: number;
		color: string;
		cut: number;
		group: NodeGroup;
		forceLabel: boolean;
	};

	type EdgeAttributes = {
		size: number;
		label?: string;
		color?: string;
		type?: string;
	};

	const arrowProgram: EdgeProgramType<NodeAttributes, EdgeAttributes> =
		EdgeArrowProgram as unknown as EdgeProgramType<NodeAttributes, EdgeAttributes>;

	let colorProbe: HTMLSpanElement | undefined;

	function appColor(color: string): string {
		colorProbe ??= document.createElement('span');
		colorProbe.style.color = `var(--${color})`;
		if (!colorProbe.isConnected) document.body.appendChild(colorProbe);

		return getComputedStyle(colorProbe).color;
	}

	function resolveGraphColors(graph: SigmaGraph): void {
		graph.forEachNode((node: string, attributes: NodeAttributes): void => {
			graph.setNodeAttribute(node, 'color', appColor(attributes.color));
		});

		graph.forEachEdge((edge: string, attributes: EdgeAttributes): void => {
			if (attributes.color === undefined) return;
			graph.setEdgeAttribute(edge, 'color', appColor(attributes.color));
		});
	}

	function nodeLabelColor(data: unknown): string {
		const node: { cut?: number; group?: NodeGroup } = data as { cut?: number; group?: NodeGroup };
		if (node.cut !== undefined && node.cut > 0) return appColor('unsatisfied-color');
		if (node.group === 'decision') return appColor('decision-color');
		return appColor('border-color');
	}

	const drawNodeLabelAbove: NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes> = (
		context: NodeLabelParameters[0],
		data: NodeLabelParameters[1],
		settings: NodeLabelParameters[2]
	): void => {
		if (!data.label) return;

		const size: number = settings.labelSize;
		const labelY: number = data.y - data.size - 6;

		context.save();
		context.font = `${settings.labelWeight} ${size}px ${settings.labelFont}`;
		context.textAlign = 'center';
		context.textBaseline = 'bottom';

		context.fillStyle = appColor('main-bg-color');

		context.fillStyle = nodeLabelColor(data);
		context.fillText(data.label, data.x, labelY);
		context.restore();
	};

	const drawEmptyNodeHover: NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes> = () => {};

	const sigmaSettings: Partial<Settings<NodeAttributes, EdgeAttributes>> = {
		defaultEdgeType: 'arrow',
		defaultDrawNodeLabel: drawNodeLabelAbove,
		defaultDrawNodeHover: drawEmptyNodeHover,
		labelRenderedSizeThreshold: 0,
		edgeProgramClasses: {
			arrow: arrowProgram
		}
	};

	let container: HTMLDivElement;
	let renderer: Sigma<NodeAttributes, EdgeAttributes> | undefined;
	let mounted: boolean = $state(false);
	let implicationGraph: ImplicationGraph | undefined;
	let cleanCutPerimeters: (() => void)[] = [];

	let trail: ReturnType<typeof getFocusedTrail> = $derived(getFocusedTrail());

	function createGraph(): void {
		if (!mounted || !container) return;

		cleanContours();
		renderer?.kill();
		renderer = undefined;
		implicationGraph = undefined;

		if (trail.getState() !== 'conflict' || !trail.hasConflictiveClause()) return;

		implicationGraph = new ImplicationGraph(trail);
		const graph: SigmaGraph = implicationGraph.toSigmaDirectedGraph();
		resolveGraphColors(graph);

		renderer = new Sigma<NodeAttributes, EdgeAttributes>(graph, container, sigmaSettings);
		drawCutPerimeters();
	}

	function refreshRenderer(): void {
		if (!mounted || !container || implicationGraph === undefined) return;

		cleanContours();
		renderer?.kill();
		const graph: SigmaGraph = implicationGraph.toSigmaDirectedGraph();
		resolveGraphColors(graph);

		renderer = new Sigma<NodeAttributes, EdgeAttributes>(graph, container, sigmaSettings);
		drawCutPerimeters();
	}

	function handleResolutionStep(): void {
		if (implicationGraph === undefined) createGraph();
		if (implicationGraph?.cut()) refreshRenderer();
	}

	function drawCutPerimeters(): void {
		if (renderer === undefined) return;

		const currentRenderer: Sigma<NodeAttributes, EdgeAttributes> = renderer;
		const graph: SigmaGraph = currentRenderer.getGraph();
		const cuts: Set<number> = new Set<number>();

		graph.forEachNode((_: string, attributes: NodeAttributes): void => {
			if (attributes.cut > 0) cuts.add(attributes.cut);
		});

		Array.from(cuts).forEach((cut: number): void => {
			const nodes: string[] = graph.filterNodes(
				(_: string, attributes: NodeAttributes): boolean =>
					attributes.cut > 0 && attributes.cut <= cut
			);

			if (nodes.length === 0) return;

			cleanCutPerimeters.push(
				bindWebGLLayer(
					`cut-${cut}`,
					currentRenderer,
					createContoursProgram(nodes, {
						radius: 150,
						border: {
							color: appColor('unsatisfied-color'),
							thickness: 8
						},
						levels: [
							{
								color: appColor('main-bg-color'),
								threshold: 0.5
							}
						]
					})
				)
			);
		});
	}

	function cleanContours(): void {
		cleanCutPerimeters.forEach((clean: () => void): void => clean());
		cleanCutPerimeters = [];
	}

	$effect((): void => {
		trail.getState();
		trail.nAssignments();
		trail.hasConflictiveClause();
		createGraph();
	});

	onMount((): (() => void) => {
		mounted = true;
		createGraph();

		const unsubscribeResolutionStep: () => void =
			resolutionStepEventBus.subscribe(handleResolutionStep);

		return (): void => {
			unsubscribeResolutionStep();
		};
	});

	onDestroy((): void => {
		cleanContours();
		colorProbe?.remove();
		renderer?.kill();
	});
</script>

<div bind:this={container} class="graph"></div>

<style>
	.graph {
		width: 100%;
		height: 500px;
		background-color: var(--main-bg-color);
		border: 1px solid var(--border-color);
		border-radius: 8px;
	}
</style>
