<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import claimsToHtml from '$lib/transversal/mapping/claimsToHtml.ts';
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		dimacsInstance: DimacsInstance;
	}

	type Html = string;

	let { dimacsInstance }: Props = $props();

	let items: Html[] = $derived(dimacsInstance?.html ?? claimsToHtml(dimacsInstance.summary.claims));

	let previewObserver: ResizeObserver;
	let virtualHeight: number = $state(0);
	let itemSize: number = $state(40);

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
	<p class="title">{dimacsInstance.name}</p>
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

	<div class="dimacs-footer">
		<div class="footer-statistics">
			<p>Variables: <span class="ocurrences"> {dimacsInstance.summary.varCount}</span></p>
			<p>Clauses: <span class="ocurrences">{dimacsInstance.summary.clauseCount}</span></p>
		</div>
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

	:global(.literal) {
		color: blue;
		font-weight: bold;
	}

	:global(.delimiter) {
		color: red;
		display: none;
	}

	:global(.literal, .delimiter) {
		width: 3rem;
		text-align: right;
	}

	:global(.comment) {
		padding-left: 5px;
		padding-right: 5px;
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
