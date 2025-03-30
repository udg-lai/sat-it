<script lang="ts">
	import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
	import { logFatal } from '$lib/transversal/utils/logging.ts';
	import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

	interface Props {
		dimacs: DimacsInstance;
	}

	let { dimacs }: Props = $props();

	let headerHtml = $state('');

	const { summary }: DimacsInstance = dimacs;
	const { varCount, clauseCount }: Summary = summary;

	headerHtml = `<p>cnf ${varCount} ${clauseCount}</p>`;

	const claimToHtml = (claim: number[]): string => {
		const [eos, ...clause] = [...claim].reverse();
		if (eos !== 0) {
			logFatal('Claim end of sequence not found');
		}
		clause.reverse();
		console.log(clause);
		let html;
		if (clause.length === 0) {
			html = `<p></p>`;
		} else {
			const [fst, ...rest] = clause;
			html = `<p>${fst}`;
			html += rest.map((lit) => ` ${lit}`).join(' ');
			html += `</p>`;
		}
		return html;
	};
</script>

<p>{dimacs.instanceName}</p>
<p>{@html headerHtml}</p>

{#each dimacs?.summary.claims.original as claim}
	{@html claimToHtml(claim)}
{/each}
