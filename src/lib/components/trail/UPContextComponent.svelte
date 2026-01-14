<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import type { UPContext } from '$lib/entities/Trail.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { isLeft, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import type { Lit, NeverFn } from '$lib/types/types.ts';
	import { error } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	interface LevelContext {
		context: Either<UPContext, NeverFn>;
		level: number;
	}

	interface Context {
		clause: Clause;
		hidden: Lit[];
	}

	interface Props {
		context: LevelContext[];
	}

	let { context }: Props = $props();

	function computeUPcontext(): Either<Context, NeverFn>[] {
		const upContext: Either<UPContext, NeverFn>[] = context;
		return upContext.map((c) => {
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

	let upContext: Either<Context, NeverFn>[] = $derived.by(computeUPcontext);

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
		{#each upContext as ctx, index (index)}
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
