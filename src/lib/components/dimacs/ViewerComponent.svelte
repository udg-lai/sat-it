<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type { Claim, RawClause } from '$lib/transversal/utils/parsers/dimacs.ts';
	import {
		fromJust,
		isJust,
		makeJust,
		makeNothing,
		type Maybe
	} from '$lib/transversal/utils/types/maybe.ts';
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		dimacsInstance: DimacsInstance;
	}

	let { dimacsInstance }: Props = $props();

	let items: string[] = $derived(makeHtmlItems(dimacsInstance));

	let previewObserver: ResizeObserver;
	let virtualHeight: number = $state(0);
	let itemSize: number = $state(40);

	type Html = string;

	function makeHtmlItems(instance: DimacsInstance): Html[] {
		const clauseToHtml = (clause: RawClause): Html => {
			return (
				`<p class="clause">` +
				clause
					.map((lit) => {
						return `<span class="${lit === 0 ? 'delimiter' : 'literal'}">${lit}</span>`;
					})
					.join('') +
				`</p>`
			);
		};

		const commentToHtml = (comment: string): Maybe<Html> => {
			const trimmed = comment.trim();
			if (trimmed.length === 0 || trimmed === '%c') {
				return makeNothing();
			} else {
				return makeJust(`<p class="comment">` + trimmed.slice(2) + `</p>`);
			}
		};

		const claimToHtml = (claim: Claim): Html[] => {
			const { comments, clause } = claim;

			const htmlComments: Html[] = comments.map(commentToHtml).filter(isJust).map(fromJust);

			const eos = clause[clause.length - 1];
			if (eos !== 0) {
				logFatal('Claim end of sequence not found');
			}
			const htmlClause = clauseToHtml(clause);

			return [...htmlComments, htmlClause];
		};

		const { claims } = instance.summary;

		const items: Html[] = claims.flatMap(claimToHtml);

		return items;
	}

	function updateHeight(htmlElement: HTMLElement) {
		if (previewObserver) previewObserver.disconnect();

		previewObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const h = entry.contentRect.height - itemSize / 2;
				virtualHeight = Math.max(h, 0);
			}
		});
		previewObserver.observe(htmlElement);
		return {
			destroy() {
				previewObserver.disconnect();
			}
		};
	}
</script>

<div class="dimacs-viewer-component">
	<div class="dimacs-header">
		<h3>{dimacsInstance.name}</h3>
	</div>

	<div class="dimacs-header" style="padding-top: 0rem;">
		<p>Variables: {dimacsInstance.summary.varCount}</p>
		<p>Clauses: {dimacsInstance.summary.clauseCount}</p>
	</div>

	<div class="dimacs-list border-b" use:updateHeight>
		<VirtualList
			width="100%"
			height={virtualHeight}
			scrollDirection="vertical"
			itemCount={items.length}
			{itemSize}
		>
			<div slot="item" class="item-list" let:index let:style {style}>
				{@html items[index]}
			</div>
		</VirtualList>
	</div>
</div>

<style>
	.dimacs-viewer-component {
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

	.dimacs-header {
		display: flex;
		justify-content: center;
		padding: 0.5rem 0rem;
		gap: 1rem;
	}

	.border-b {
		border-bottom-width: 1px;
	}

	h3 {
		font-size: 1.5rem;
	}

	:global(.literal) {
		color: blue;
		font-weight: bold;
	}

	:global(.delimiter) {
		color: red;
	}

	:global(.literal, .delimiter) {
		display: inline-block;
		width: 20px;
		text-align: right;
	}

	:global(.comment) {
		color: rgb(107 114 128 / var(--tw-text-opacity, 1));
		background-color: #f6f8fa;
		font-family: monospace;
		font-style: italic;
		display: block;
	}

	:global(.clause) {
		display: flex;
		gap: 1rem;
	}

</style>
