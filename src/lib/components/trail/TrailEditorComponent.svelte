<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import TrailComponent from './TrailComponent.svelte';
	import { trailTrackingEventBus } from '$lib/transversal/events.ts';

	interface Props {
		trails: Trail[];
	}

	let { trails }: Props = $props();

	let indexes: number[] = $derived.by(() => {
		return trails.map((_, index) => index);
	});

	let editorElement: HTMLDivElement;
	let trailsLeafElement: HTMLElement;

	const scrollToBottom = (editorElement: HTMLElement) => {
		editorElement.scrollTo({ top: editorElement.scrollHeight, behavior: 'smooth' });
	};

	function rearrangeTrailEditor(reference: number) {
		const scrollLeft = Math.max(0, reference - (trailsLeafElement.offsetWidth * 2) / 3);
		trailsLeafElement.scrollTo({
			left: scrollLeft,
			behavior: 'smooth'
		});
	}

	function listenContentHeight(element: HTMLElement) {
		const heightObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const contentHeight: number = entry.contentRect.height;
				if (contentHeight > editorElement.offsetHeight) {
					scrollToBottom(editorElement);
				}
			}
		});
		heightObserver.observe(element);
		return {
			destroy() {
				heightObserver.disconnect();
			}
		};
	}

	onMount(() => {
		const unsubscribeTrailTracking = trailTrackingEventBus.subscribe(rearrangeTrailEditor);
		return () => {
			unsubscribeTrailTracking();
		};
	});
</script>

<trail-editor bind:this={editorElement}>
	<editor-leaf use:listenContentHeight>
		<editor-indexes class="enumerate">
			{#each indexes as index}
				<div class="item">
					<span>{index}</span>
				</div>
			{/each}
		</editor-indexes>

		<trails-leaf bind:this={trailsLeafElement}>
			<editor-trails>
				{#each trails as trail, index}
					<TrailComponent {trail} isLast={trails.length === index + 1} />
				{/each}
			</editor-trails>
		</trails-leaf>
	</editor-leaf>
</trail-editor>

<style>
	trail-editor {
		display: block;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	editor-leaf {
		display: grid;
		grid-template-columns: var(--trail-height) 1fr;
		height: fit-content;
	}

	editor-indexes {
		display: flex;
		flex-direction: column;
		padding-right: 0.5rem;
	}

	trails-leaf {
		overflow-x: auto;
		overflow-y: hidden;
		height: fit-content;
	}

	editor-trails {
		display: flex;
		flex-direction: column;
		width: max-content;
	}

	.enumerate .item {
		height: var(--trail-height);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
