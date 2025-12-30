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
	import type { CRef } from '$lib/types/types.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import HeadTailComponent from '../HeadTailComponent.svelte';
	import MathTexComponent from '../MathTexComponent.svelte';

	const solverMachine = $derived(getSolverMachine());

	let clauses: Clause[] = $derived.by(() => {
		const cRefs: CRef[] = getOccurrenceList().getCRefs();
		return cRefs.map((cRef) => getClausePool().at(cRef));
	});

	let focusCRef: CRef | undefined = $derived.by(() => {
		if (getOccurrenceList().getPointer() < 0) {
			return undefined;
		} else {
			return getOccurrenceList().pointedCRef();
		}
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

<div class="enumerate-clause">
	<div class="enumerate"></div>
	<HeadTailComponent display={focusCRef === undefined}>
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
	{#each clauses as clause, i (i)}
		<div class="enumerate-clause">
			<div class="enumerate">
				<span>
					{clause.getCRef()}.
				</span>
			</div>
			<HeadTailComponent
				display={focusCRef === clause.getCRef() && solverMachine.onDetectingConflict()}
			>
				<div
					class="clause-highlighter"
					class:inspectedTrue={isSat(clause)}
					class:inspectedFalse={isUnSat(clause)}
					class:visited-clause={getOccurrenceList().getPointer() >= i &&
						isPartial(clause) &&
						solverMachine.onDetectingConflict()}
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
