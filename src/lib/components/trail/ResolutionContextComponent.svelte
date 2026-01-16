<script lang="ts">
	import type { ResolutionContext } from '$lib/entities/Trail.svelte.ts';
	import { isLeft, type Either } from '$lib/types/either.ts';
	import type { NeverFn } from '$lib/types/types.ts';
	import { onMount } from 'svelte';
	import PlainClauseComponent from '../PlainClauseComponent.svelte';

	interface Props {
		context: Either<ResolutionContext, NeverFn>[];
	}

	let { context }: Props = $props();

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
							clause={ctx.left.clause}
							hidden={[]}
							state="unsatisfied"
							style={'justify-content: start;'}
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
