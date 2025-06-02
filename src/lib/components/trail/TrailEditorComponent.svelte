<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import TrailComponent from './TrailComponent.svelte';
	import { trailTrackingEventBus } from '$lib/transversal/events.ts';

	interface Props {
		trails: Trail[];
	}

	let { trails }: Props = $props();

	let editorElement: HTMLDivElement;
	let trailsLeafElement: HTMLElement;
	let editorTrailsElement: HTMLElement;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	function rearrangeTrailEditor(reference: number) {
		        const scrollLeft = Math.max(0, reference - (trailsLeafElement.offsetWidth * 2 / 3));
		trailsLeafElement.scrollTo({
			left: scrollLeft,
			behavior: 'smooth'
		});
	}

	onMount(() => {
		const unsubscribeTrailTracking = trailTrackingEventBus.subscribe(rearrangeTrailEditor)
		return () => {
			unsubscribeTrailTracking();
		};
	})
</script>

<trail-editor bind:this={editorElement}>
	<editor-leaf>
		<editor-indexes class="enumerate">
			{#each trails as trail, index}
				<div class="item">
					<span>{index}</span>
				</div>
			{/each}
		</editor-indexes>

		<trails-leaf bind:this={trailsLeafElement}>
			<editor-trails bind:this={editorTrailsElement}>
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
	}

	editor-leaf {
		display: grid;
		grid-template-columns: var(--trail-height) 1fr; /* indexes | trails */
		height: 100%;
		overflow-y: auto; /* vertical scroll for the whole area */
		overflow-x: hidden;
	}

	editor-indexes {
		display: flex;
		flex-direction: column;
		padding-right: 0.5rem;
	}

	trails-leaf {
		overflow-x: auto; /* horizontal scroll */
		overflow-y: hidden;
		height: fit-content; /* only as tall as content */
	}

	editor-trails {
		display: flex;
		flex-direction: column;
		width: max-content; /* allows horizontal scrolling */
	}

	.enumerate .item {
		height: var(--trail-height);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
