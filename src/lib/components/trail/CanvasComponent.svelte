<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import { isLeft, unwrapEither, type Either } from '$lib/types/either.ts';
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
		repeat?: boolean
	}

	let { context, width, align, reverse = false, repeat = true}: Props = $props();
</script>

<trail-canvas class="canvas" style="--width: {width}px">
	<div class="canvas-sheet" style="--align: {align}">
		{#each context as ctx}
			{#if isLeft(ctx)}
				<PlainClauseComponent {reverse} clause={unwrapEither(ctx).clause} hide={repeat ? [] : [unwrapEither(ctx).literal]} />
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
		height: 9rem;
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
	}
</style>
