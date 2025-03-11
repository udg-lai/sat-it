<script lang="ts">
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { get, writable, type Writable } from 'svelte/store';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		previousTrails: TrailCollection;
		currentTrail: Trail;
		collapse: boolean;
	}
	let { previousTrails, currentTrail, collapse }: Props = $props();

	let hoverIndex: number = $state(-1);

	let trails: Trail[] = $derived(
		(collapse ? [currentTrail] : [...previousTrails, currentTrail]).reverse()
	);

	let expandedWritable: Writable<boolean[]> = writable([]);

	$effect(() => {
		let or = get(expandedWritable).reverse();
		let state = trails.map((_, idx) => or[idx] || false).reverse();
		expandedWritable.set(state);
	});

	function toggleExpand(index: number) {
		const state = get(expandedWritable);
		const updated = [...state];
		updated[index] = !updated[index];
		expandedWritable.set(updated);
	}

	function handleHoverLine(index: number) {
		hoverIndex = index;
	}

	function handleLeaveLine() {
		hoverIndex = -1;
	}

	function uuid(index: number): number {
		return trails.length - index;
	}
</script>

<div class="trail-visualizer flex flex-row">
	<div class="trails flex flex-col">
		{#each trails as trail, i (uuid(i))}
			<div class="line">
				<button
					class="enumerate transition"
					onmouseenter={() => handleHoverLine(i)}
					onmouseleave={() => handleLeaveLine()}
					onclick={() => toggleExpand(i)}
				>
					<span class="line-item chakra-petch-medium">
						{#if hoverIndex !== i}
							<p>{i}</p>
						{:else if $expandedWritable[i]}
							<ChevronLeftOutline slot="icon" class="h-8 w-8" />
						{:else}
							<ChevronRightOutline slot="icon" class="h-8 w-8" />
						{/if}
					</span>
				</button>
				<TrailComponent {trail} />
			</div>
		{/each}
	</div>
</div>

<style>
	.line {
		display: flex;
		position: relative;
	}

	.line span {
		position: absolute;
		align-self: center;
	}

	.line-item {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	.enumerate {
		display: flex;
		justify-content: center;
		width: 4rem;
		height: 4rem;
		position: relative;
	}

	.trails {
		height: 100%;
		gap: 0.5rem;
		display: flex;
		flex-direction: column;
	}

	.trail-visualizer {
		padding: 1rem;
		height: 50rem;
		overflow-y: scroll;
	}
</style>
