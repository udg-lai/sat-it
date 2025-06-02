<script lang="ts">
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import TrailComponent from './TrailComponent.svelte';

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

<trail-editor bind:this={editorElement}>
	<editor-leaf>
		<editor-indexes>
			{#if init && init.length > 0}
				<div class="enumerate">
					{#each init as trail, index}
						<div class="item">
							<span>{index}</span>
						</div>
					{/each}
				</div>
			{/if}
			{#if last}
				<div class="enumerate">
					<div class="item">
						<span>{trails.length}</span>
					</div>
				</div>
			{/if}
		</editor-indexes>

		<trails-leaf>
			<editor-trails>
				{#if init && init.length > 0}
					{#each init as trail, index}
						<TrailComponent {trail} isLast={false} />
					{/each}
				{/if}
				{#if last}
					<TrailComponent trail={last} isLast={true} />
				{/if}
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
