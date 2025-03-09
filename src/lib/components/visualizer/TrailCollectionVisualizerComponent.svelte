<script lang="ts">
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import TrailVisualizerComponent from '$lib/components/visualizer/TrailVisualizerComponent.svelte';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';

	interface Props {
		previousTrails: TrailCollection;
		currentTrail: Trail;
		collapse: boolean;
	}
	let { previousTrails, currentTrail, collapse }: Props = $props();

	let trails: Trail[] = $derived(
		(collapse ? [currentTrail] : [...previousTrails, currentTrail]).reverse()
	);
</script>

<div class="trail-visualizer flex flex-col">
	{#each trails as trail}
		<TrailVisualizerComponent {trail} />
	{/each}
</div>

<style>
	.trail-visualizer {
		padding: 1rem;
	}
</style>
