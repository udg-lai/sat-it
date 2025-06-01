<script lang="ts">
	import TrailLineComponent from '$lib/components/trail/TailLineComponent.svelte';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';

	interface Props {
		trails: Trail[];
	}

	let { trails }: Props = $props();

	let last: Trail | undefined = $derived(trails[trails.length - 1]);
	let init: Trail[] | undefined = $derived(trails.slice(0, -1));

	let editorElement: HTMLDivElement;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};
</script>

<div bind:this={editorElement} class="trail-visualizer flex flex-row">
	<trails class="trails flex flex-col">
		{#if init && init.length > 0}
			{#each init as trail, index}
				<TrailLineComponent
					trail={trail}
					index={index + 1}
					isLast={false}
				/>
			{/each}
		{/if}
		{#if last}
			<TrailLineComponent
				trail={last}
				index={trails.length}
				isLast={true}
			/>
		{/if}
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
		flex: 1;
		padding: 0 0.5rem;
		overflow-y: scroll;
	}
</style>
