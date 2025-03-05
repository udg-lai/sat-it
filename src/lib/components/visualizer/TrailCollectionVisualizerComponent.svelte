<script lang="ts">
	import { slide } from 'svelte/transition';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import TrailVisualizerComponent from '$lib/components/visualizer/TrailVisualizerComponent.svelte';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';

	interface Props {
		trailCollection: TrailCollection;
		trail: Trail;
		visualizeTrails: boolean;
	}
	let { trailCollection, trail, visualizeTrails }: Props = $props();
</script>

<div class="flex flex-col">
	{#if visualizeTrails}
		{#each trailCollection as trail}
			<div transition:slide|global>
				<TrailVisualizerComponent {trail} />
			</div>
		{/each}
		<div transition:slide|global>
			<TrailVisualizerComponent {trail} />
		</div>
	{:else}
		<div in:slide|global out:slide={{ duration: 1 }}>
			<TrailVisualizerComponent {trail} />
		</div>
	{/if}
</div>
