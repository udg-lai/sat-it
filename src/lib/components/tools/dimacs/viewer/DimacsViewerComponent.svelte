<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

	interface Props {
		dimacs: DimacsInstance;
	}

	let { dimacs }: Props = $props();

	const { summary }: DimacsInstance = dimacs;
	const { varCount, clauseCount }: Summary = summary;

	const header = `<div class="header">cnf ${varCount} ${clauseCount}</div>`;

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

	const originalClaims = dimacs.summary.claims.original;
	const claims = claimsToHtml(originalClaims);
</script>

{@html header}
{@html claims}

<style>
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

	:global(.header) {
		font-weight: bold;
		font-size: 1.2em;
		color: darkgreen;
		margin-bottom: 8px;
	}

	:global(.clause) {
		display: flex;
		gap: 5px;
	}
</style>
