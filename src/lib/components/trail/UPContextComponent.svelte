<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type { Trail, UPContext } from '$lib/entities/Trail.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import type { Lit, NeverFn } from '$lib/types/types.ts';
	import { error } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	interface Context {
		clause: Clause;
		hidden: Lit[];
	}

	interface Props {
		trail: Trail;
	}

	let { trail }: Props = $props();

	function computeVisibleContext(
		context: Either<UPContext, NeverFn>[]
	): Either<Context, NeverFn>[] {
		const visibleContext: Either<UPContext, NeverFn>[] = context.filter((_, pos: number) => {
			const dl: number = trail.dlOfPosition(pos);
			// Any decision or expanded decision level shows its UP context
			// The context of a decision is always shown
			// Any propagation before any decision is always shown
			return dl == 0 || trail.isDecision(pos) || trail.isDLExpanded(dl);
		});

		return visibleContext.map((c: Either<UPContext, NeverFn>) => {
			if (isLeft(c)) {
				const { reasonCRef, propagated }: UPContext = unwrapEither(c);
				const clause: Clause = getClausePool().at(reasonCRef);
				return makeLeft({
					clause,
					hidden: [propagated]
				});
			} else return makeRight(error);
		});
	}

	let context: Either<Context, NeverFn>[] = $derived.by(() =>
		computeVisibleContext(trail.getUPContext())
	);

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

<div class="scrollable-context" class:is-scrollable={isScrollable} bind:this={scrollEl}>
	<up-context>
		{#each context as ctx, index (index)}
			{#if isLeft(ctx)}
				<PlainClauseComponent
					clause={ctx.left.clause}
					hidden={ctx.left.hidden}
					state="satisfied"
					style="justify-content: end;"
				/>
			{:else}
				<div class="empty-slot"></div>
			{/if}
		{/each}
	</up-context>
</div>

<style>
	up-context {
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

	.scrollable-context.is-scrollable {
		cursor: ns-resize; /* or grab, or row-resize */
	}

	.scrollable-context.is-scrollable:hover {
		cursor: ns-resize;
	}
</style>
