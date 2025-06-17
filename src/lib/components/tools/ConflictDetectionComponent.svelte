<script lang="ts">
	import {
		getCheckingIndex,
		getClausesToCheck
	} from '$lib/store/conflict-detection-state.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import type Clause from '$lib/transversal/entities/Clause.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
	import { isSatClause, isUnSATClause } from '$lib/transversal/entities/Clause.ts';

	const problem: Problem = $derived(getProblemStore());

	let clauses: Clause[] = $derived.by(() => {
		const target: number[] = getClausesToCheck();
		const cPool: ClausePool = problem.clauses;
		return target.map((id) => cPool.get(id));
	});

	let checkingIndex: number = $derived(getCheckingIndex());
</script>

{#each clauses as clause, index (index)}
	<div class="enumerate-clause">
		<div class="enumerate">
			<span>
				{clause.getId()}.
			</span>
		</div>
		<div
			class="clause-highlighter"
			class:inspecting={checkingIndex === index}
			class:inspectedTrue={checkingIndex >= index && isSatClause(clause.eval())}
			class:inspectedFalse={checkingIndex >= index && isUnSATClause(clause.eval())}
		>
			<ClauseComponent {clause} />
		</div>
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

	.clause-highlighter {
		border: solid;
		border-width: 0px;
		border-bottom-width: 1px;
		border-color: var(--main-bg-color);
	}

	.inspecting {
		border-color: var(--inspecting-color);
	}

	.inspectedTrue {
		background-color: var(--shaded-satisfied-color);
	}

	.inspectedFalse {
		background-color: var(--shaded-unsatisfied-color);
	}
</style>
