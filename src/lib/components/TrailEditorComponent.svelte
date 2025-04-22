<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import IndexedTrailComponent from './trail/IndexedTrailComponent.svelte';

	interface IndexedTrail {
		index: number;
		trail: Trail;
	}

	interface Props {
		trails: Trail[];
		showOnlyLast?: boolean;
	}

	let { trails, showOnlyLast = false }: Props = $props();

	let indexedTrails: IndexedTrail[] = $derived.by(() => {
		const indexed = trails.map((t, idx) => {
			return {
				index: idx,
				trail: t
			};
		});
		return showOnlyLast ? indexed.slice(-1) : indexed;
	});

	let lastTrail: HTMLDivElement;
	$effect(() => {
		if (trails) scrollToBottom(lastTrail);
	});

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
</script>

<div bind:this={lastTrail} class="trail-visualizer flex flex-row">
	<div class="trails flex flex-col">
		{#each indexedTrails as indexedTrail (indexedTrail.index)}
			<IndexedTrailComponent trail={indexedTrail.trail} index={indexedTrail.index} />
		{/each}
	</div>
</div>

<style>
	.trails {
		height: 100%;
		gap: 0.5rem;
		display: flex;
		flex-direction: column;
	}

	.trail-visualizer {
		padding: 1rem;
		flex: 1;
		overflow-y: scroll;
	}
</style>
