<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import {
		isSatClause,
		isUnitClause,
		isUnresolvedClause,
		isUnSATClause
	} from '$lib/entities/Clause.svelte.ts';
	import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
	import type Problem from '$lib/entities/Problem.svelte.ts';
	import { getCheckingIndex, getOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
	import { getClausePool, getProblemStore } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import type { CRef } from '$lib/types/types.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import MathTexComponent from '../MathTexComponent.svelte';

	const problem: Problem = $derived(getProblemStore());

	const solverMachine = $derived(getSolverMachine());
	const onPreConflictState: boolean = $derived(solverMachine.onPreConflictState());

	let clauses: Clause[] = $derived.by(() => {
		const cRefs: CRef[] = getOccurrenceList().getClauses();
		return cRefs.map((cRef) => getClausePool().at(cRef));
	});

	type MaybeClause = Clause | undefined;

	let toDisplay: MaybeClause[] = $derived.by(() => {
		return [undefined].concat(clauses.map((clause) => clause as MaybeClause));
	});

	let focusCRef: CRef = $derived(getOccurrenceList().pointedCRef());

	function isSat(clause: Clause): boolean {
		return isSatClause(clause.eval());
	}

	function isUnSat(clause: Clause): boolean {
		return isUnSATClause(clause.eval());
	}

	function isPartial(clause: Clause): boolean {
		const evaluation = clause.eval();
		return isUnresolvedClause(evaluation) || isUnitClause(evaluation);
	}
</script>

<div class="enumerate-clause">
	<div class="enumerate"></div>
	<HeadTailComponent display={onPreConflictState}>
		<div class="static">
			{#if clauses.length !== 0}
				{#each clauses[0] as lit, i (i)}
					<MathTexComponent equation={lit.toTeX()} />
					{#if i < clauses[0].size() - 1}
						<MathTexComponent equation={'\\lor'} fontSize={'1rem'} />
					{/if}
				{/each}
			{:else}
				<MathTexComponent equation={'1'} />
			{/if}
		</div>
	</HeadTailComponent>
</div>

<conflict-detection>
	{#each clauses as clause, index (index)}
		<div class="enumerate-clause">
			<div class="enumerate">
				<span>
					{clause.getCRef()}.
				</span>
			</div>
			<HeadTailComponent display={focusCRef === clause.getCRef() && !onPreConflictState}>
				<div
					class="clause-highlighter"
					class:inspectedTrue={isSat(clause)}
					class:inspectedFalse={isUnSat(clause)}
					class:visited-clause={focusCRef >= index && isPartial(clause) && !onPreConflictState}
				>
					<ClauseComponent {clause} />
				</div>
			</HeadTailComponent>
		</div>
	{/each}
</conflict-detection>

<style>
	.static {
		color: var(--main-bg-color);
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		padding: 0.25rem;
	}

	.enumerate-clause {
		display: flex;
		height: 100%;
		flex-direction: row;
		gap: 0.5rem;
		align-items: end;
		height: 50px;
		align-items: center;
		width: fit-content;
	}

	.enumerate {
		width: 3.5rem;
		display: flex;
		align-items: end;
		justify-content: center;
		font-size: 1rem;
		opacity: var(--opacity-50);
	}

	.inspectedTrue {
		background-color: var(--shaded-satisfied-color);
	}

	.inspectedFalse {
		background-color: var(--unsatisfied-color-o);
	}

	.visited-clause {
		background-color: var(--visited-clause-color);
	}
</style>
