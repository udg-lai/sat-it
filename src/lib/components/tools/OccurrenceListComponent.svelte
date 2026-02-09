<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import {
		isSatisfiedEval,
		isUnitEval,
		isUnresolvedEval,
		isUnsatisfiedEval
	} from '$lib/entities/Clause.svelte.ts';
	import type OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
	import type { EWC } from '$lib/entities/Problem.svelte.ts';
	import { obtainCRefFromEWC } from '$lib/solvers/shared.svelte.ts';
	import { getClausePool, getCurrentOccurrences, getCurrentWatch } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { fromLeft, fromRight, isLeft, makeLeft, makeRight, type Either } from '$lib/types/either.ts';
	import { isJust, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
	import type { CRef } from '$lib/types/types.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import { fromJust } from './../../types/maybe.ts';
	import HeadTailComponent from './../HeadTailComponent.svelte';

	type ClauseToVisit = {
		clause: Clause,
		toVisit: boolean
	};

	let clauses: Maybe<ClauseToVisit>[] = $derived.by(() => {
		const cRefs: CRef[] = getCurrentOccurrences().getOccurrences();
		const watches: EWC[] = getCurrentWatch().getOccurrences();
		const watchedCRefs: Set<CRef> = new Set<CRef>(watches.map(obtainCRefFromEWC));
		const realClauses: Maybe<ClauseToVisit>[] = cRefs.map((cRef) => 
				makeJust({
					clause: getClausePool().at(cRef),
					toVisit: getSolverMachine().identify() === 'twatch' 
						? watchedCRefs.has(cRef)
						: true
				}));
			
		console.log(realClauses)
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

	type ECWL = Either<OccurrenceList<CRef>, OccurrenceList<EWC>>;
	
	const currentOccurrenceList: ECWL = 
		$derived(getSolverMachine().identify() === 'twatch' 
			? makeRight(getCurrentWatch()) 
			: makeLeft(getCurrentOccurrences()));
	
	function currentCRefs(): CRef[] {
		if(isLeft(currentOccurrenceList)) {
			return fromLeft(currentOccurrenceList).getOccurrences()
		} else {
			return fromRight(currentOccurrenceList).getOccurrences().map(obtainCRefFromEWC)
		}
	}

	function currentPointer(): number {
		if(isLeft(currentOccurrenceList)) {
			return fromLeft(currentOccurrenceList).getPointer()
		} else {
			return fromRight(currentOccurrenceList).getPointer()
		}
	}
</script>

<occurrence-list>
	{#each clauses as maybeClause, i}
		<div class="occurrence-list-item">
			<HeadTailComponent
				display={isJust(maybeClause) 
							? fromJust(maybeClause).clause.getCRef() === currentCRefs()[currentPointer()] 
							: false
				}
				verticalList={true}
			>
				<div class="enumerate" class:inspecting={ isJust(maybeClause) 
							? fromJust(maybeClause).clause.getCRef() === currentCRefs()[currentPointer()] 
							: currentPointer() === -1 
								? true
								: false
				}>
					{#if isJust(maybeClause)}
						<span>
							{fromJust(maybeClause).clause.getCRef()}.
						</span>
					{:else}
						<span></span>
					{/if}
				</div>
			</HeadTailComponent>

			{#if isJust(maybeClause)}
				<div
					class="clause-highlighter"
					class:inspectedTrue={isSat(fromJust(maybeClause).clause)}
					class:inspectedFalse={isUnSat(fromJust(maybeClause).clause)}
					class:visited-clause={getCurrentOccurrences().getPointer() >= i &&
						isPartial(fromJust(maybeClause).clause) && fromJust(maybeClause).toVisit}
					class:willSkip={!fromJust(maybeClause).toVisit}  
				>
					<ClauseComponent clause={fromJust(maybeClause).clause} />
				</div>
			{/if}
		</div>
	{/each}
</occurrence-list>

<style>

	.willSkip {
		opacity: 0.3;
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
