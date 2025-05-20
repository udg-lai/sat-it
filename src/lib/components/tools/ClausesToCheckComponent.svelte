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
	<div class="enumerate-clause">
		<div class="enumerate">
			<span>
				{clause.getId()}.
			</span>
		</div>
		<ClauseComponent {clause} />
	</div>
{/each}

<style>
	.enumerate-clause {
		display: flex;
		width: 100%;
		height: 100%;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		height: 50px;
	}

	.enumerate {
		width: 3.5rem;
		display: flex;
		align-items: end;
		justify-content: center;
		font-size: 1rem;
		opacity: 0.5;
	}
</style>
