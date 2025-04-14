<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		dimacsInstance: DimacsInstance;
	}

	let { dimacsInstance }: Props = $props();

	let claims: string[] = $derived(makeClaims(dimacsInstance));

	let previewObserver: ResizeObserver;
	let virtualHeight: number = $state(0);
	let itemSize: number = $state(40);

	function makeClaims(instance: DimacsInstance): string[] {
		const { summary }: DimacsInstance = instance;

		const claimToHtml = (claim: number[]): string => {
			const eos = claim[claim.length - 1];
			if (eos !== 0) {
				logFatal('Claim end of sequence not found');
			}
			const html = claim
				.map((lit) => {
					return `<span class="${lit === 0 ? 'delimiter' : 'literal'}">${lit}</span>`;
				})
				.join(' ');
			return html;
		};

		const claimsToHtml = (claims: number[][]): string[] => {
			return claims.map((claim) => {
				return `<div class="clause">` + claimToHtml(claim) + `</div>`;
			});
		};

		const originalClaims = summary.claims.original;
		const claims = claimsToHtml(originalClaims);
		return claims;
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
		<h3>{dimacsInstance.instanceName}</h3>
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
			itemCount={claims.length}
			{itemSize}
		>
			<div slot="item" class="item-list" let:index let:style {style}>
				{@html claims[index]}
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
</style>
