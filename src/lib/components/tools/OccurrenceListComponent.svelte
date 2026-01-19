<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import {
		isSatisfiedEval,
		isUnitEval,
		isUnresolvedEval,
		isUnsatisfiedEval
	} from '$lib/entities/Clause.svelte.ts';
	import { getOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { isJust, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
	import type { CRef } from '$lib/types/types.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import { fromJust } from './../../types/maybe.ts';
	import HeadTailComponent from './../HeadTailComponent.svelte';

	const solverMachine = $derived(getSolverMachine());

	let clauses: Maybe<Clause>[] = $derived.by(() => {
		const cRefs: CRef[] = getOccurrenceList().getCRefs();
		const realClauses: Maybe<Clause>[] = cRefs.map((cRef) => makeJust(getClausePool().at(cRef)));
		return [makeNothing(), ...realClauses];
	});

	function isSat(clause: Clause): boolean {
		return isSatisfiedEval(clause.eval());
	}

	function isUnSat(clause: Clause): boolean {
		return isUnsatisfiedEval(clause.eval());
	}

	function isPartial(clause: Clause): boolean {
		const evaluation = clause.eval();
		return isUnresolvedEval(evaluation) || isUnitEval(evaluation);
	}
</script>

<occurrence-list>
	{#each clauses as maybeClause, i (i)}
		<div class="occurrence-list-item">
			<HeadTailComponent display={getOccurrenceList().getPointer() + 1 === i} verticalList={true}>
				<div class="enumerate" class:inspecting={getOccurrenceList().getPointer() + 1 === i}>
					{#if isJust(maybeClause)}
						<span>
							{fromJust(maybeClause).getCRef()}.
						</span>
					{:else}
						<span></span>
					{/if}
				</div>
			</HeadTailComponent>

			{#if isJust(maybeClause)}
				<div
					class="clause-highlighter"
					class:inspectedTrue={isSat(fromJust(maybeClause))}
					class:inspectedFalse={isUnSat(fromJust(maybeClause))}
					class:visited-clause={getOccurrenceList().getPointer() >= i &&
						isPartial(fromJust(maybeClause)) &&
						solverMachine.onDetectingConflict()}
				>
					<ClauseComponent clause={fromJust(maybeClause)} />
				</div>
			{/if}
		</div>
	{/each}
</occurrence-list>

<style>
	.inspectedTrue {
		background-color: var(--shaded-satisfied-color);
	}

	.inspectedFalse {
		background-color: var(--unsatisfied-color-o);
	}

	.visited-clause {
		background-color: var(--visited-clause-color);
	}

	occurrence-list {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	occurrence-list .occurrence-list-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
		padding: 0.2rem 0.4rem;
	}

	.enumerate {
		width: var(--assignment-width);
		height: var(--assignment-width);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: right;
		opacity: var(--non-inspecting-opacity);
	}

	.inspecting {
		opacity: 1;
	}
</style>
