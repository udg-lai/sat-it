<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import IndexedTrailComponent from './trail/IndexedTrailComponent.svelte';

	interface IndexedTrail {
		index: number;
		trail: Trail;
		expandPropagations: boolean;
	}

	interface Props {
		trails: Trail[];
		expandPropagations: boolean;
	}

	let { trails, expandPropagations }: Props = $props();

	let indexedTrails: IndexedTrail[] = $derived.by(() => {
		return trails.map((t, idx) => {
			return {
				index: idx,
				trail: t,
				expandPropagations
			};
		});
	});

	let editorElement: HTMLDivElement;

	$effect(() => {
		if (trails) scrollToBottom(editorElement);
	});

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
</script>

<div bind:this={editorElement} class="trail-visualizer flex flex-row">
	<trails class="trails flex flex-col">
		{#each indexedTrails as indexedTrail (indexedTrail.index)}
			<IndexedTrailComponent
				trail={indexedTrail.trail}
				index={indexedTrail.index}
				expanded={indexedTrail.expandPropagations}
			/>
		{/each}
	</trails>
</div>

<style>
	.trails {
		width: 100%;
		height: 100%;
		gap: 0.5rem;
		display: flex;
		flex-direction: column;
	}

	.trail-visualizer {
		padding: 0.5rem;
		flex: 1;
		overflow-y: scroll;
	}
</style>
