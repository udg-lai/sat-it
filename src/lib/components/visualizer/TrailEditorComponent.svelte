<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import TrailComponent from './TrailComponent.svelte';
	import { get, writable, type Writable } from 'svelte/store';

	interface Props {
		trails: Trail[];
		editorExpanded?: boolean;
	}
	let { trails, editorExpanded }: Props = $props();

	// denotes over which trail user is hover
	let hoverIndex: number = $state(-1);

	interface IndexedTrail {
		index: number;
		trail: Trail;
	}

	let expandedWritable: Writable<boolean[]> = writable([]);

	$effect(() => {
		let or = get(expandedWritable);
		let state = trails.map((_,idx) => or[idx] ?? true);
		expandedWritable.set(state);
	});

	const makeIndexedTrail = (
		index: number,
		trail: Trail
	): IndexedTrail => {
		return { index, trail};
	};

	const toIndexedTrails = (trails: Trail[]): IndexedTrail[] => {
		const indexTrails = trails
			.map((trail, idx) => {
				return makeIndexedTrail(idx, trail);
			})
			.reverse();
		return editorExpanded ? indexTrails : indexTrails.slice(0, 1);
	};

	let indexedTrail = $derived(toIndexedTrails(trails));

	function toggleExpand(index: number) {
		checkTrailIndex(index);
		expandedWritable.update(state => {
			const updated = [...state];
			updated[index] = !updated[index]
			return updated
		})
	}

	function handleHoverLine(index: number) {
		hoverIndex = index;
	}

	function checkTrailIndex(index: number): number {
		if (index < 0 || index >= trails.length) {
			logFatal('Trail index out of range', `Expected index range [0, ${trails.length - 1}]`);
		}
		return index;
	}

	function handleLeaveLine() {
		hoverIndex = -1;
	}

	function isActiveTrail(index: number): boolean {
		return index === indexedTrail[0].index;
	}
</script>

<div class="trail-visualizer flex flex-row">
	<div class="trails flex flex-col">
		{#each indexedTrail as { trail, index} (index)}
			<div class="line">
				<button
					class="enumerate transition"
					onmouseenter={() => handleHoverLine(index)}
					onmouseleave={() => handleLeaveLine()}
					onclick={() => toggleExpand(index)}
				>
					<span class="line-item chakra-petch-medium" class:line-item-active={isActiveTrail(index)}>
						{#if hoverIndex !== index}
							<p>{index}</p>
						{:else if $expandedWritable[index]}
							<ChevronLeftOutline slot="icon" class="h-8 w-8" />
						{:else}
							<ChevronRightOutline slot="icon" class="h-8 w-8" />
						{/if}
					</span>
				</button>
				<TrailComponent {trail} expandPropagations={$expandedWritable[index]} />
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

	.line-item-active {
		opacity: 1;
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
