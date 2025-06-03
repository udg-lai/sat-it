<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import TrailComponent from './TrailComponent.svelte';
	import { toggleTrailExpandEventBus, trailTrackingEventBus } from '$lib/transversal/events.ts';
	import InformationComponent from './InformationComponent.svelte';

	interface Props {
		trails: Trail[];
	}

	let { trails }: Props = $props();

	let indexes: number[] = $derived.by(() => {
		return trails.map((_, index) => index);
	});

	let editorElement: HTMLDivElement;
	let trailsLeafElement: HTMLElement;
	let userInteracting: boolean = $state(false);
	let grabbing: boolean = $state(false);
	let interactingTimeout: number | undefined = undefined;
	let userScrolling: boolean = $state(false);
	let scrollTimeout: number | undefined = undefined;
	let lastReference: number = $state(0);
	const recoveryTimeout: number = 3000;

	let expandedTrails: boolean = $state(true);

	const scrollToBottom = (editorElement: HTMLElement) => {
		editorElement.scrollTo({ top: editorElement.scrollHeight, behavior: 'smooth' });
	};

	function handleVerticalScroll() {
		if (scrollTimeout !== undefined) {
			clearTimeout(scrollTimeout);
		}
		userScrolling = true;
		scrollTimeout = setTimeout(() => {
			userScrolling = false;
			rearrangeTrailEditor(lastReference);
		}, recoveryTimeout);
	}

	function handleMouseDown() {
		if (interactingTimeout !== undefined) {
			clearTimeout(interactingTimeout);
		}
		userInteracting = true;
		grabbing = true;
	}

	function handleMouseUp() {
		if (interactingTimeout !== undefined) {
			clearTimeout(interactingTimeout);
		}
		interactingTimeout = setTimeout(() => {
			userInteracting = false;
			rearrangeTrailEditor(lastReference);
		}, recoveryTimeout);
		grabbing = false;
	}

	function rearrangeTrailEditor(reference: number) {
		lastReference = reference;
		if (userInteracting || userScrolling) {
			return;
		}
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
		const unsubscribeExpandedTrails = toggleTrailExpandEventBus.subscribe(
			(expanded) => (expandedTrails = expanded)
		);
		return () => {
			unsubscribeTrailTracking();
			unsubscribeExpandedTrails();
		};
	});
</script>

<trail-editor
	bind:this={editorElement}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onscroll={handleVerticalScroll}
	role="presentation"
	tabindex="-1"
	class:grabbing={grabbing}
>
	<editor-leaf use:listenContentHeight>
		<editor-indexes class="enumerate">
			{#each indexes as index (index)}
				<div class="item">
					<div class="enumerate-item">
						<span>{index + 1}.</span>
					</div>
				</div>
			{/each}
		</editor-indexes>

		<trails-leaf bind:this={trailsLeafElement}>
			<editor-trails>
				{#each trails as trail, index (index)}
					<TrailComponent {trail} expanded={expandedTrails} isLast={trails.length === index + 1} />
				{/each}
			</editor-trails>
		</trails-leaf>

		<editor-info>
			{#each trails as trail, index (index)}
				<div class="item">
					<InformationComponent {trail} />
				</div>
			{/each}
		</editor-info>
	</editor-leaf>
</trail-editor>

<style>
	trail-editor {
		display: block;
		height: 75%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1.5rem 0.5rem;
	}

	.grabbing {
		cursor: grabbing;
	}

	editor-leaf {
		display: grid;
		grid-template-columns: var(--trail-height) 1fr var(--trail-height);
		height: fit-content;
	}

	editor-indexes {
		display: flex;
		flex-direction: column;
	}

	trails-leaf {
		overflow-x: auto;
		overflow-y: hidden;
		height: fit-content;
		scrollbar-gutter: stable;
	}

	editor-trails {
		display: flex;
		flex-direction: column;
		width: max-content;
	}

	.item {
		height: var(--trail-height);
		width: var(--trail-height);
		display: flex;
		align-items: start;
		justify-content: center;
	}

	.enumerate-item {
		pointer-events: none;
		width: var(--trail-literal-min-width);
		height: var(--trail-literal-min-width);
		display: flex;
		justify-content: center;
		align-items: end;
	}

	.item span {
		opacity: var(--opacity-50);
	}
</style>
