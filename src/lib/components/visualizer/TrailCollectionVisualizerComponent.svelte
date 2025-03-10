<script lang="ts">
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import TrailVisualizerComponent from '$lib/components/visualizer/TrailVisualizerComponent.svelte';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { ChevronLeftOutline } from 'flowbite-svelte-icons';

	interface Props {
		previousTrails: TrailCollection;
		currentTrail: Trail;
		collapse: boolean;
	}
	let { previousTrails, currentTrail, collapse }: Props = $props();

	let trails: Trail[] = $derived(
		(collapse ? [currentTrail] : [...previousTrails, currentTrail]).reverse()
	);

	let expanded: boolean[] = $state([...previousTrails, currentTrail].map(() => false));

	function toggleExpand(index: number) {
		expanded[index] = !expanded[index];
		console.log($state.snapshot(expanded));
	}
</script>

<div class="trail-visualizer flex flex-row">
	<div class="trails flex flex-col">
		{#each trails as trail, i (i)}
			<div class="line">
				<button class="enumerate transition" onclick={() => toggleExpand(i)}>
					<span class="line-item chakra-petch-medium" class:animate-to-close={expanded[i]}>
						{#if expanded[i]}
							<ChevronLeftOutline slot="icon" class="h-8 w-8" />
						{:else}
							<p>{i}</p>
						{/if}
					</span>
				</button>
				<TrailVisualizerComponent {trail} />
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
	}

	/**

	@keyframes animateToOpen {
		0% {
			transform: translateX(0px);
		}
		50% {
			transform: translateX(3px);
		}
		100% {
			transform: translateX(0px);
		}
	}

	.transition:hover .animate-to-open {
		animation: animateToOpen 1.5s infinite ease-in-out;
	}
	*/

	@keyframes animateToClose {
		0% {
			transform: translateX(0px);
		}
		50% {
			transform: translateX(-3px);
		}
		100% {
			transform: translateX(0px);
		}
	}

	.transition:hover .animate-to-close {
		animation: animateToClose 1.5s infinite ease-in-out;
	}

	.trail-visualizer {
		padding: 1rem;
		height: 50rem;
		flex: 1;
		overflow-y: scroll;
	}
</style>
