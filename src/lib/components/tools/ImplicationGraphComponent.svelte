<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Sigma from 'sigma';
	import { EdgeArrowProgram } from 'sigma/rendering';
	import type { EdgeProgramType } from 'sigma/rendering';
	import { ImplicationGraph } from '$lib/entities/ImplicationGraph.svelte.ts';
	import { getFocusedTrail } from '$lib/states/trails.svelte.ts';

	type NodeAttributes = {
		label: string;
		x: number;
		y: number;
		size: number;
		color: string;
		cut: 0;
	};

	type EdgeAttributes = {
		size: number;
		label?: string;
		color?: string;
		type?: string;
	};

	const arrowProgram = EdgeArrowProgram as unknown as EdgeProgramType<
		NodeAttributes,
		EdgeAttributes
	>;

	let container: HTMLDivElement;
	let renderer: Sigma<NodeAttributes, EdgeAttributes> | undefined;
	let mounted = $state(false);

	let trail = $derived(getFocusedTrail());

	function createGraph() {
		if (!mounted || !container) return;

		renderer?.kill();
		renderer = undefined;

		if (trail.getState() !== 'conflict' || !trail.hasConflictiveClause()) return;

		let implicationGraph = new ImplicationGraph(trail);
		const graph = implicationGraph.toSigmaDirectedGraph();

		renderer = new Sigma<NodeAttributes, EdgeAttributes>(graph, container, {
			defaultEdgeType: 'arrow',
			edgeProgramClasses: {
				arrow: arrowProgram
			}
		});
	}

	$effect(() => {
		trail;
		trail.getState();
		trail.nAssignments();
		trail.hasConflictiveClause();
		if (trail.hasConflictiveClause()) {
			trail.getResolutionContext().length;
		}
		createGraph();
	});

	onMount(() => {
		mounted = true;
		createGraph();
	});

	onDestroy(() => {
		renderer?.kill();
	});
</script>

<div bind:this={container} class="graph"></div>

<style>
	.graph {
		width: 100%;
		height: 500px;
		border: 1px solid #ddd;
		border-radius: 8px;
	}
</style>
