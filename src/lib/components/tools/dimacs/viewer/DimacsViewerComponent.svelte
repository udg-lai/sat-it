<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';
	import VirtualList from 'svelte-tiny-virtual-list';

	interface Props {
		dimacsInstance: DimacsInstance;
	}

	let { dimacsInstance }: Props = $props();

	let header = $derived(makeHeader(dimacsInstance));
	let claims: string[] = $derived(makeClaims(dimacsInstance));

	let previewObserver: ResizeObserver;
	let virtualHeight: number = $state(0);

	function makeHeader(instance: DimacsInstance): string {
		const { summary }: DimacsInstance = instance;
		const { varCount, clauseCount }: Summary = summary;
		const header = `<div class="header">cnf ${varCount} ${clauseCount}</div>`;
		return header;
	}

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
				virtualHeight = entry.contentRect.height - 25;
			}
			console.log(virtualHeight);
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
	<p>Instance: {dimacsInstance.instanceName}</p>
	<p>Variables: {dimacsInstance.summary.varCount}</p>
	<p>Clauses: {dimacsInstance.summary.clauseCount}</p>

	<div class="dimacs-list" use:updateHeight>
		<VirtualList
			width="100%"
			height={virtualHeight}
			scrollDirection="vertical"
			itemCount={claims.length}
			itemSize={50}
		>
			<div slot="item" let:index let:style {style}>
				{@html claims[index]}
			</div>
		</VirtualList>
	</div>
</div>

<!--


 -->

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
		flex:1;
	}
</style>
