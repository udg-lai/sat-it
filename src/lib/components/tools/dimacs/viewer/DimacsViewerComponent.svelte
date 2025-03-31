<script lang="ts">
	import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

	interface Props {
		summary: Summary;
	}

	let { summary }: Props = $props();

	const { varCount, clauseCount, claims }: Summary = summary;
	const { original } = claims;

	let dimacsHeader = `cnf ${varCount} ${clauseCount}`;
	let dimacsBody = original.map((c) => c.map((l) => l.toString()).join(' '));

	console.log(dimacsHeader, dimacsBody);
</script>
