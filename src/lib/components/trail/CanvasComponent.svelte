<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import { isLeft, unwrapEither, type Either } from '$lib/types/either.ts';
	import { onMount } from 'svelte';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	export interface UPRelation {
		clause: Clause;
		literal: number;
	}

	export type CanvasContext = Either<UPRelation, undefined>[];

	interface Props {
		context: CanvasContext;
		width: number;
		align: 'end' | 'start';
		reverse?: boolean;
		repeat?: boolean;
		displayBackground?: boolean;
	}

	let {
		context,
		width,
		align,
		reverse = false,
		repeat = true,
		displayBackground = false
	}: Props = $props();

	let canvasContainer: HTMLDivElement;

	function scrollToBottom(): void {
		if (reverse) {
			canvasContainer.scrollTop = canvasContainer.scrollHeight;
		} else {
			canvasContainer.scrollTop = 0;
		}
	}

	$effect(() => {
		if (context) scrollToBottom(); // Scroll to bottom when context changes
	});
</script>

<trail-canvas class="canvas" bind:this={canvasContainer} style="--width: {width}px">
	<div class="canvas-sheet" style="--align: {align}">
		{#each context as ctx}
			{#if isLeft(ctx)}
				<PlainClauseComponent
					{reverse}
					clause={unwrapEither(ctx).clause}
					hide={repeat ? [] : [unwrapEither(ctx).literal]}
					{displayBackground}
				/>
			{:else}
				<div class="empty-slot"></div>
			{/if}
		{/each}
	</div>
</trail-canvas>

<style>
	.empty-slot {
		width: var(--empty-slot);
	}

	.canvas {
		height: 126px;
		width: var(--width);
		overflow-y: auto;
		overflow-x: hidden;
		-ms-overflow-style: none; /* Internet Explorer 10+ */
		scrollbar-width: none; /* Firefox */
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
	}
</style>
