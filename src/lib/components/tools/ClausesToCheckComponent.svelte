<script lang="ts">
	import { getClausesToCheck } from '$lib/store/clausesToCheck.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import type { SvelteSet } from 'svelte/reactivity';
	import ClauseComponent from '../ClauseComponent.svelte';

	let clauses = $derived.by(() => {
		const problem = $problemStore;
		if (problem === undefined) return [];
		else {
			const clausesToCheck: SvelteSet<number> = getClausesToCheck();
			const allClauses: Clause[] = problem.clauses.getClauses();
			return allClauses.filter((clause) => clausesToCheck.has(clause.getId()));
		}
	});
</script>

{#each clauses as clause, id (id)}
	<ClauseComponent {clause} />
{/each}

<style>
</style>
