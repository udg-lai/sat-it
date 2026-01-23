<script lang="ts">
	import type { ResolutionContext, Trail } from '$lib/entities/Trail.svelte.ts';
	import { isLeft, type Either } from '$lib/types/either.ts';
	import type { NeverFn } from '$lib/types/types.ts';
	import { onMount } from 'svelte';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	interface Props {
		trail: Trail;
	}

	function computeVisibleContext(
		context: Either<ResolutionContext, NeverFn>[]
	): Either<ResolutionContext, NeverFn>[] {
		const alignedContext: Either<ResolutionContext, NeverFn>[] = context.slice(
			0,
			trail.nAssignments()
		);
		const conflictiveClause: Either<ResolutionContext, NeverFn> = context[context.length - 1];

		const visibleContext: Either<ResolutionContext, NeverFn>[] = alignedContext.filter(
			(_, pos: number) => {
				const dl: number = trail.dlOfPosition(pos);
				// Any decision or expanded decision level shows its resolution context
				// The context of a decision is always shown
				// Any propagation before any decision is always shown
				return dl == 0 || trail.isDecision(pos) || trail.isDLExpanded(dl);
			}
		);
		return [...visibleContext, conflictiveClause];
	}

	let context: Either<ResolutionContext, NeverFn>[] = $derived.by(() =>
		computeVisibleContext(trail.getResolutionContext())
	);

	let { trail }: Props = $props();

	let scrollEl: HTMLDivElement;
	let isScrollable = $state(false);

	function updateScrollable() {
		if (!scrollEl) return;
		isScrollable = scrollEl.scrollHeight > scrollEl.clientHeight;
	}

	onMount(() => {
		updateScrollable();
	});
</script>

<div class="scrollable-wrapper">
	<div class="scrollable-context" class:is-scrollable={isScrollable} bind:this={scrollEl}>
		<resolution-context>
			{#each context as ctx, index (index)}
				{#if isLeft(ctx)}
					{#if ctx.left.clause.isEmpty()}
						<empty-clause></empty-clause>
					{:else}
						<PlainClauseComponent
							literals={ctx.left.clause.getLiterals()}
							satisfiedClause={false}
							satisfiedLiterals={false}
						/>
					{/if}
				{:else}
					<div class="empty-slot"></div>
				{/if}
			{/each}
		</resolution-context>
	</div>
</div>

<style>
	resolution-context {
		display: flex;
		flex-direction: row;
		gap: var(--assignments-gap);
	}

	.empty-slot {
		height: var(--assignment-width);
		width: var(--assignment-width);
	}

	.scrollable-context {
		max-height: var(--context-max-height);
		overflow-y: auto;
	}

	.scrollable-wrapper {
		padding-bottom: var(--composed-top);
		width: fit-content;
	}

	.scrollable-context.is-scrollable {
		cursor: ns-resize; /* or grab, or row-resize */
	}

	.scrollable-context.is-scrollable:hover {
		cursor: ns-resize;
	}

	empty-clause {
		height: var(--font-size);
		width: var(--font-size);
		color: var(--clause-color);
		border-color: var(--unsatisfied-color);
		border-width: 1px;
	}
</style>
