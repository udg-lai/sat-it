<script lang="ts">
	import ClauseComponent from '$lib/components/ClauseComponent.svelte';
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import {
		isRight,
		makeLeft,
		makeRight,
		unwrapEither,
		type Either,
		type Left,
		type Right
	} from '$lib/types/either.ts';
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		itemHeight?: number;
	}

	let { itemHeight = 50 }: Props = $props();

	let virtualHeight: number = $state(0);

	function updateHeight(element: HTMLElement) {
		const previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const h = entry.contentRect.height - itemHeight / 2;
				virtualHeight = Math.max(h, 0);
			}
		});
		previewObserver.observe(element);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}

	let clauses: Clause[] = $derived(getClausePool().getClauses());

	let summary: Either<Clause, string>[] = $derived.by(() => {
		const poolSize: number = getClausePool().size();
		const learntSize: number = getClausePool().getLearnt().length;

		const originalClauses = clauses.slice(0, poolSize - learntSize);
		const learnedClauses = clauses.slice(poolSize - learntSize);

		const originalPart = originalClauses.flatMap((c) => {
			const comments: Right<string>[] = c.getComments().map(makeRight);
			const clause: Left<Clause> = makeLeft(c);
			return [...comments, clause];
		});

		const learntPart = learnedClauses.flatMap((c) => {
			const comments: Right<string>[] = c.getComments().map(makeRight);
			const clause: Left<Clause> = makeLeft(c);
			return [...comments, clause];
		});

		if (learntPart.length > 0) {
			return [...originalPart, makeRight('Learnt clauses'), ...learntPart];
		} else {
			return [...originalPart];
		}
	});
</script>

<solution-summary use:updateHeight>
	<VirtualList
		width="100%"
		height={virtualHeight}
		scrollDirection="vertical"
		itemCount={summary.length}
		itemSize={itemHeight}
	>
		<div slot="item" class="item-list" let:index let:style {style}>
			{#if isRight(summary[index])}
				{@render renderComment(unwrapEither(summary[index]))}
			{:else}
				{@render renderClause(unwrapEither(summary[index]))}
			{/if}
		</div>
	</VirtualList>
</solution-summary>

{#snippet renderClause(clause: Clause)}
	<div class="tagged-clause">
		<span class="enumerate">{clause.getTag()}.</span>
		<ClauseComponent {clause} />
	</div>
{/snippet}

{#snippet renderComment(comment: string)}
	<div class="item-wrapper">
		<span class="comment">{comment}</span>
	</div>
{/snippet}

<style>
	solution-summary {
		display: flex;
		flex: 1;
		flex-direction: column;
		padding: 0.5rem 1rem;
		gap: 0.25rem;
	}

	.item-wrapper {
		display: flex;
		flex: 1;
		align-items: center;
		height: 100%;
	}

	.tagged-clause {
		display: flex;
		flex: 1;
		flex-direction: row;
		height: 100%;
		align-items: center;
		gap: 0.5rem;
	}

	.enumerate {
		opacity: 0.5;
		justify-content: center;
		width: 2.5rem;
	}

	.comment {
		color: rgb(107 114 128 / var(--tw-text-opacity, 1));
		background-color: var(--comment-bg-color);
		font-family: monospace;
		font-style: italic;
		display: block;
		width: fit-content;
	}
</style>
