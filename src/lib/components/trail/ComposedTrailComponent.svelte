<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import type Literal from '$lib/entities/Literal.svelte.ts';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';
	import PlainLiteralComponent from '../PlainLiteralComponent.svelte';
	import TrailComponent from './TrailComponent.svelte';

	interface Props {
		trail: Trail;
		expanded: boolean;
		isLast?: boolean;
		showUPView: boolean;
		showCAView: boolean;
	}

	let { trail, expanded, isLast = true, showUPView, showCAView }: Props = $props();

	let upContext: Either<Clause, undefined>[] = $derived.by(() => {
		const upContext: Either<number, undefined>[] = trail.getUPContext();
		return upContext.map((c) => {
			if (isLeft(c)) {
				return makeLeft(getClause(unwrapEither(c)));
			} else return makeRight(undefined);
		});
	});

	let clausePool: ClausePool = $derived(getClausePool());

	let trailWidth = $state(0);

	function observeWidth(element: HTMLElement) {
		const previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				trailWidth = entry.contentRect.width;
			}
		});
		previewObserver.observe(element);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}

	function getClause(clauseId: number): Clause {
		return clausePool.get(clauseId);
	}
</script>

<composed-trail class="composed-trail">
	{#if showUPView}
		<div class="canvas" style="--width: {trailWidth}px">
			<div class="canvas-sheet">
				{#each upContext as clause}
					{#if isLeft(clause)}
						<PlainClauseComponent clause={unwrapEither(clause)} />
					{:else}
						<div class="empty-slot"></div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
	<div use:observeWidth class="fit-content">
		<TrailComponent {trail} {expanded} {isLast} />
	</div>
	{#if showCAView}
		<div class="canvas" style="--width: {trailWidth}px"></div>
	{/if}
</composed-trail>

<style>
	.composed-trail {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		border: 1px solid red;
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
		align-items: end;
		min-height: 100%;
	}

	.fit-content {
		width: fit-content;
	}

	.vertical-container {
		display: flex;
	}

	.empty-slot {
		width: 55px;
	}
</style>
