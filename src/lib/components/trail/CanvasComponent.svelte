<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import { isLeft, unwrapEither, type Either } from '$lib/types/either.ts';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	interface Props {
		context: Either<Clause, undefined>[];
		width: number;
		align: 'end' | 'start';
		reverse?: boolean;
	}

	let { context, width, align, reverse = false }: Props = $props();
</script>

<trail-canvas class="canvas" style="--width: {width}px">
	<div class="canvas-sheet" style="--align: {align}">
		{#each context as clause}
			{#if isLeft(clause)}
				<PlainClauseComponent {reverse} clause={unwrapEither(clause)} />
			{:else}
				<div class="empty-slot"></div>
			{/if}
		{/each}
	</div>
</trail-canvas>

<style>
	.empty-slot {
		width: 55px;
	}

	.canvas {
		height: 9rem;
		width: var(--width);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.canvas-sheet {
		width: fit-content;
		display: flex;
		align-items: var(--align);
		min-height: 100%;
	}
</style>
