<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import { isLeft, unwrapEither, type Either } from '$lib/types/either.ts';
	import type { Lit, NeverFn } from '$lib/types/types.ts';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	export interface PlainClauseProps {
		clause: Clause;
		hidden: Lit[];
	}

	export type CanvasContext = Either<PlainClauseProps, NeverFn>[];

	interface Props {
		context: CanvasContext;
		width: number;
		align: 'end' | 'start';
		reverse?: boolean;
		repeat?: boolean;
		aspect?: string;
	}

	let { context, width, align, reverse = false, repeat = true, aspect }: Props = $props();

	let canvasContainer: HTMLDivElement;

	function scrollToBottom(): void {
		if (reverse) {
			canvasContainer.scrollTop = canvasContainer.scrollHeight;
		} else {
			canvasContainer.scrollTop = 0;
		}
	}

	let style: string = $derived.by(() => {
		return aspect ? aspect : '' + '--width: ' + width + 'px;';
	});


	$effect(() => {
		if (context) scrollToBottom(); // Scroll to bottom when context changes
	});
</script>

<trail-canvas class="canvas" bind:this={canvasContainer} style={style}>
	<div class="canvas-sheet" style="--align: {align}">
		{#each context as ctx, index (index)}
			{#if isLeft(ctx)}
				<PlainClauseComponent
					{reverse}
					clause={unwrapEither(ctx).clause}
					hidden={unwrapEither(ctx).hidden}
					state={!repeat ? 'satisfied' : index === context.length - 1 ? 'unsatisfied' : undefined}
				/>
			{:else}
				<div class="empty-slot"></div>
			{/if}
		{/each}
	</div>
</trail-canvas>

<style>
	.empty-slot {
		width: var(--vertical-clause-width);
	}

	.canvas {
		height: 150px;
		width: var(--width);
		overflow-y: auto;
		overflow-x: hidden;
		-ms-overflow-style: none; /* Internet Explorer 10+ */
		scrollbar-width: none; /* Firefox */
		cursor: ns-resize;
	}

	.canvas::-webkit-scrollbar {
		display: none; /* Safari and Chrome */
	}

	.canvas-sheet {
		width: fit-content;
		display: flex;
		align-items: var(--align);
		min-height: 100%;
		color: var(--unsatisfied-color);
		gap: var(--vertical-clauses-gap);
	}
</style>
