<script lang="ts">
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import type { Claim } from '$lib/parsers/dimacs.ts';
	import { isRight, makeLeft, makeRight, unwrapEither, type Either } from '$lib/types/either.ts';
	import { makeTuple, type Tuple } from '$lib/types/tuple.ts';
	import VirtualList from 'svelte-tiny-virtual-list';
	import LiteralsComponent from '../LiteralsComponent.svelte';

	interface Props {
		instance: DimacsInstance;
		itemHeight?: number;
	}

	let { instance, itemHeight = 50 }: Props = $props();

	let virtualHeight: number = $state(0);

	let claims: Claim[] = $derived(instance.summary.claims);
	let varCount: number = $derived(instance.summary.varCount);
	let clauseCount: number = $derived(instance.summary.clauseCount);

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

	let summary: Either<Tuple<number, number[]>, string>[] = $derived.by(() => {
		return claims.flatMap(({ comments, literals, id }) => {
			return [...comments.map(makeRight), makeLeft(makeTuple(id, literals))];
		});
	});
</script>

<problem-summary>
	<p class="title">{instance.name}</p>
	<div class="dimacs-list border-b" use:updateHeight>
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
					{@render renderLiterals(unwrapEither(summary[index]))}
				{/if}
			</div>
		</VirtualList>
	</div>

	<div class="dimacs-footer">
		<div class="footer-statistics">
			<p>Variables: <span class="ocurrences">{varCount}</span></p>
			<p>Clauses: <span class="ocurrences">{clauseCount}</span></p>
		</div>
	</div>
</problem-summary>

{#snippet renderLiterals(literals: Tuple<number, number[]>)}
	<div class="item-wrapper">
		<p class="enumerate">{literals.fst}.</p>
		<LiteralsComponent literals={literals.snd} />
	</div>
{/snippet}

{#snippet renderComment(comment: string)}
	<div class="item-wrapper">
		<p class="comment">{comment}</p>
	</div>
{/snippet}

<style>
	problem-summary {
		flex: 1;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.dimacs-list {
		position: relative;
		display: flex;
		flex: 1;
	}

	.item-list {
		display: flex;
		align-items: center;
	}

	.title {
		padding-bottom: 1rem;
		text-align: center;
		font-size: 1.2rem;
	}

	.dimacs-footer {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		padding-top: 1rem;
	}

	.footer-statistics {
		display: flex;
		justify-content: space-around;
	}

	.border-b {
		border-bottom-width: 1px;
	}

	.item-wrapper {
		display: flex;
		flex: 1;
		align-items: end;
		height: 100%;
	}

	.item-wrapper p {
		display: inline-block;
		margin: 0;
	}

	.enumerate {
		opacity: 0.5;
		width: 3rem;
	}

	.comment {
		color: rgb(107 114 128 / var(--tw-text-opacity, 1));
		background-color: #f6f8fa;
		font-family: monospace;
		font-style: italic;
		display: block;
		width: fit-content;
	}

	:global(.virtual-list-wrapper) {
		scrollbar-width: none;
	}

	:global(.scrollable::-webkit-scrollbar) {
		display: none;
	}

	.ocurrences {
		width: 2rem;
		display: inline-block;
		text-align: right;
	}
</style>
