<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

	interface Props {
		dimacsInstance: DimacsInstance;
	}

	let { dimacsInstance }: Props = $props();

	let header = $derived(makeHeader(dimacsInstance));
	let claims = $derived(makeClaims(dimacsInstance));

	function makeHeader(instance: DimacsInstance): string {
		const { summary }: DimacsInstance = instance;
		const { varCount, clauseCount }: Summary = summary;
		const header = `<div class="header">cnf ${varCount} ${clauseCount}</div>`;
		return header;
	}

	function makeClaims(instance: DimacsInstance): string {
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

		const claimsToHtml = (claims: number[][]): string => {
			return claims
				.map((claim) => {
					return `<div class="clause">` + claimToHtml(claim) + `</div>`;
				})
				.join('');
		};

		const originalClaims = summary.claims.original;
		const claims = claimsToHtml(originalClaims);
		return claims;
	}
</script>

{@html header}
{@html claims}
