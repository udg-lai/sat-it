// <script lang="ts">
// 	import { onDestroy, onMount } from 'svelte';
// 	import Sigma from 'sigma';
// 	import { EdgeArrowProgram } from 'sigma/rendering';
// 	import type { EdgeProgramType, NodeLabelDrawingFunction } from 'sigma/rendering';
// 	import type { Settings } from 'sigma/settings';
// 	import { ImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
// 	import { resolutionStepEventBus } from '$lib/events/events.ts';
// 	import { getFocusedTrail } from '$lib/states/trails.svelte.ts';
//
// 	type NodeGroup = 'conflict' | 'decision' | 'propagation' | 'conflictReason' | 'learned';
// 	type SigmaGraph = ReturnType<ImplicationGraph['toSigmaDirectedGraph']>;
// 	type SigmaRenderer = Sigma<NodeAttributes, EdgeAttributes>;
// 	type NodeLabelParameters = Parameters<NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes>>;
// 	type Cleanup = () => void;
//
// 	type NodeAttributes = {
// 		label: string;
// 		x: number;
// 		y: number;
// 		size: number;
// 		color: string;
// 		cut: number;
// 		group: NodeGroup;
// 		forceLabel: boolean;
// 	};
//
// 	type EdgeAttributes = {
// 		size: number;
// 		label?: string;
// 		color?: string;
// 		type?: string;
// 		cut: boolean;
// 	};
//
// 	const arrowProgram: EdgeProgramType<NodeAttributes, EdgeAttributes> =
// 		EdgeArrowProgram as unknown as EdgeProgramType<NodeAttributes, EdgeAttributes>;
// 	const CUT_LAYER_ID = 'cut-semicircles';
// 	const CUT_COLOR = 'unsatisfied-color';
// 	const DECISION_COLOR = 'decision-color';
// 	const LABEL_COLOR = 'border-color';
// 	const SEMICIRCLE_STEPS = 64;
// 	const SEMICIRCLE_LINE_WIDTH = 3;
// 	const SEMICIRCLE_DASH = [12, 8];
// 	const SEMICIRCLE_START_ANGLE = Math.PI * 0.6;
// 	const SEMICIRCLE_END_ANGLE = Math.PI * 1.4;
//
// 	let colorProbe: HTMLSpanElement | undefined;
//
// 	function appColor(color: string): string {
// 		colorProbe ??= document.createElement('span');
// 		colorProbe.style.color = `var(--${color})`;
// 		if (!colorProbe.isConnected) document.body.appendChild(colorProbe);
//
// 		return getComputedStyle(colorProbe).color;
// 	}
//
// 	function resolveGraphColors(graph: SigmaGraph): void {
// 		graph.forEachNode((node: string, attributes: NodeAttributes): void => {
// 			graph.setNodeAttribute(node, 'color', appColor(attributes.color));
// 		});
//
// 		graph.forEachEdge((edge: string, attributes: EdgeAttributes): void => {
// 			if (attributes.color === undefined) return;
// 			graph.setEdgeAttribute(edge, 'color', appColor(attributes.color));
// 		});
// 	}
//
// 	function nodeLabelColor(data: unknown): string {
// 		const node: { cut?: number; group?: NodeGroup } = data as { cut?: number; group?: NodeGroup };
// 		if (node.cut !== undefined && node.cut > 0) return appColor(CUT_COLOR);
// 		if (node.group === 'decision') return appColor(DECISION_COLOR);
// 		return appColor(LABEL_COLOR);
// 	}
//
// 	const drawNodeLabelAbove: NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes> = (
// 		context: NodeLabelParameters[0],
// 		data: NodeLabelParameters[1],
// 		settings: NodeLabelParameters[2]
// 	): void => {
// 		if (!data.label) return;
//
// 		const size: number = settings.labelSize;
// 		const labelY: number = data.y;
//
// 		context.save();
// 		context.font = `${settings.labelWeight} ${size}px ${settings.labelFont}`;
// 		context.textAlign = 'center';
// 		context.textBaseline = 'bottom';
// 		context.fillStyle = nodeLabelColor(data);
// 		context.fillText(data.label, data.x, labelY);
// 		context.restore();
// 	};
//
// 	const drawEmptyNodeHover: NodeLabelDrawingFunction<NodeAttributes, EdgeAttributes> = () => {};
//
// 	const sigmaSettings: Partial<Settings<NodeAttributes, EdgeAttributes>> = {
// 		defaultEdgeType: 'arrow',
// 		defaultDrawNodeLabel: drawNodeLabelAbove,
// 		defaultDrawNodeHover: drawEmptyNodeHover,
// 		labelRenderedSizeThreshold: 0,
// 		edgeReducer: (_edge: string, attributes: EdgeAttributes): Partial<EdgeAttributes> => ({
// 			...attributes,
// 			color: appColor(attributes.cut ? CUT_COLOR : 'inspecting-color')
// 		}),
// 		edgeProgramClasses: {
// 			arrow: arrowProgram
// 		}
// 	};
//
// 	let container: HTMLDivElement;
// 	let renderer: SigmaRenderer | undefined;
// 	let mounted: boolean = $state(false);
// 	let implicationGraph: ImplicationGraph | undefined;
// 	let cleanupCutLayer: Cleanup | undefined;
//
// 	let trail: ReturnType<typeof getFocusedTrail> = $derived(getFocusedTrail());
//
// 	function createGraph(): void {
// 		if (!mounted || !container) return;
//
// 		implicationGraph = undefined;
//
// 		if (!shouldShowGraph()) {
// 			cleanRenderer();
// 			return;
// 		}
//
// 		implicationGraph = new ImplicationGraph(trail);
// 		if (shouldShowAllCuts()) implicationGraph.cutAll();
//
// 		renderImplicationGraph(implicationGraph);
// 	}
//
// 	function refreshRenderer(): void {
// 		if (!mounted || !container || implicationGraph === undefined) return;
//
// 		renderImplicationGraph(implicationGraph);
// 	}
//
// 	function renderImplicationGraph(implicationGraph: ImplicationGraph): void {
// 		const graph: SigmaGraph = implicationGraph.toSigmaDirectedGraph();
// 		resolveGraphColors(graph);
//
// 		if (renderer === undefined) {
// 			renderer = new Sigma<NodeAttributes, EdgeAttributes>(graph, container, sigmaSettings);
// 		} else {
// 			cleanCutLayer();
// 			renderer.setGraph(graph);
// 		}
//
// 		bindCutSemicircles();
// 	}
//
// 	function handleResolutionStep(): void {
// 		if (implicationGraph === undefined) createGraph();
// 		if (implicationGraph?.cut()) refreshRenderer();
// 	}
//
// 	function shouldShowGraph(): boolean {
// 		return (
// 			trail.hasConflictiveClause() &&
// 			trail.nDecisions() > 0 &&
// 			(trail.getState() === 'conflict' || trail.getState() === 'unsat' || trail.hasLemmaAttached())
// 		);
// 	}
//
// 	function shouldShowAllCuts(): boolean {
// 		return trail.getState() === 'unsat' || trail.hasLemmaAttached();
// 	}
//
// 	function bindCutSemicircles(): void {
// 		if (renderer === undefined) return;
//
// 		const currentRenderer: SigmaRenderer = renderer;
// 		const graph: SigmaGraph = currentRenderer.getGraph();
// 		const cutIds: number[] = getCutIds(graph);
//
// 		if (cutIds.length === 0) return;
//
// 		const canvas: HTMLCanvasElement = currentRenderer.createCanvas(CUT_LAYER_ID, {
// 			beforeLayer: 'edges',
// 			style: {
// 				pointerEvents: 'none'
// 			}
// 		});
// 		const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
//
// 		if (context === null) {
// 			currentRenderer.killLayer(CUT_LAYER_ID);
// 			return;
// 		}
//
// 		const drawSemicircles = (): void => {
// 			resizeCanvas(canvas, context, currentRenderer);
// 			prepareSemicircleStroke(context);
//
// 			cutIds.forEach((_: number, index: number): void => {
// 				const radius = index + 0.5;
// 				const isLatestCut = index === cutIds.length - 1;
// 				drawSemicircle(context, currentRenderer, radius, isLatestCut);
// 			});
// 		};
//
// 		currentRenderer.on('afterRender', drawSemicircles);
// 		drawSemicircles();
//
// 		cleanupCutLayer = (): void => {
// 			currentRenderer.removeListener('afterRender', drawSemicircles);
// 			try {
// 				currentRenderer.killLayer(CUT_LAYER_ID);
// 			} catch {
// 				// The layer can already be gone when Sigma itself is being killed.
// 			}
// 		};
// 	}
//
// 	function getCutIds(graph: SigmaGraph): number[] {
// 		const cutIds: Set<number> = new Set<number>();
//
// 		graph.forEachNode((_: string, attributes: NodeAttributes): void => {
// 			if (attributes.cut > 0) cutIds.add(attributes.cut);
// 		});
//
// 		return Array.from(cutIds).sort((a: number, b: number): number => a - b);
// 	}
//
// 	function resizeCanvas(
// 		canvas: HTMLCanvasElement,
// 		context: CanvasRenderingContext2D,
// 		currentRenderer: SigmaRenderer
// 	): void {
// 		const dimensions = currentRenderer.getDimensions();
// 		const pixelRatio = window.devicePixelRatio || 1;
//
// 		canvas.width = dimensions.width * pixelRatio;
// 		canvas.height = dimensions.height * pixelRatio;
// 		canvas.style.width = `${dimensions.width}px`;
// 		canvas.style.height = `${dimensions.height}px`;
//
// 		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
// 		context.clearRect(0, 0, dimensions.width, dimensions.height);
// 	}
//
// 	function prepareSemicircleStroke(context: CanvasRenderingContext2D): void {
// 		context.strokeStyle = appColor(CUT_COLOR);
// 		context.lineWidth = SEMICIRCLE_LINE_WIDTH;
// 		context.lineCap = 'round';
// 		context.lineJoin = 'round';
// 	}
//
// 	function drawSemicircle(
// 		context: CanvasRenderingContext2D,
// 		currentRenderer: SigmaRenderer,
// 		radius: number,
// 		isLatestCut: boolean
// 	): void {
// 		context.setLineDash(isLatestCut ? [] : SEMICIRCLE_DASH);
// 		context.beginPath();
//
// 		for (let step = 0; step <= SEMICIRCLE_STEPS; step++) {
// 			const progress = step / SEMICIRCLE_STEPS;
// 			const angle =
// 				SEMICIRCLE_START_ANGLE + (SEMICIRCLE_END_ANGLE - SEMICIRCLE_START_ANGLE) * progress;
// 			const point = currentRenderer.graphToViewport({
// 				x: Math.cos(angle) * radius,
// 				y: Math.sin(angle) * radius
// 			});
//
// 			if (step === 0) context.moveTo(point.x, point.y);
// 			else context.lineTo(point.x, point.y);
// 		}
//
// 		context.stroke();
// 		context.setLineDash([]);
// 	}
//
// 	function cleanRenderer(): void {
// 		const rendererToClean: SigmaRenderer | undefined = renderer;
// 		renderer = undefined;
//
// 		cleanCutLayer();
// 		rendererToClean?.kill();
// 	}
//
// 	function cleanCutLayer(): void {
// 		cleanupCutLayer?.();
// 		cleanupCutLayer = undefined;
// 	}
//
// 	$effect((): void => {
// 		trail.getState();
// 		trail.nAssignments();
// 		trail.nDecisions();
// 		trail.hasConflictiveClause();
// 		trail.hasLemmaAttached();
// 		createGraph();
// 	});
//
// 	onMount((): (() => void) => {
// 		mounted = true;
// 		createGraph();
//
// 		const unsubscribeResolutionStep: () => void =
// 			resolutionStepEventBus.subscribe(handleResolutionStep);
//
// 		return (): void => {
// 			unsubscribeResolutionStep();
// 		};
// 	});
//
// 	onDestroy((): void => {
// 		cleanRenderer();
// 		colorProbe?.remove();
// 	});
// </script>
//
// <div bind:this={container} class="graph"></div>
//
// <style>
// 	.graph {
// 		width: 100%;
// 		height: 500px;
// 		background-color: var(--main-bg-color);
// 		border: 1px solid var(--border-color);
// 		border-radius: 8px;
// 	}
// </style>
//