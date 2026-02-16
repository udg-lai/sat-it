<script lang="ts">
	import type Clause from '$lib/entities/Clause.svelte.ts';
	import {
		isSatisfiedEval,
		isUnitEval,
		isUnresolvedEval,
		isUnsatisfiedEval
	} from '$lib/entities/Clause.svelte.ts';
	import type {
		VisitingOccurrenceList,
		VisitingWatchList
	} from '$lib/entities/OccurrenceList.svelte.ts';
	import {
		getClausePool,
		getCurrentOccurrences,
		getCurrentWatch
	} from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import {
		fromLeft,
		fromRight,
		isLeft,
		isRight,
		makeLeft,
		makeRight,
		unwrapEither,
		type Either
	} from '$lib/types/either.ts';
	import { isJust, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
	import type { CRef } from '$lib/types/types.ts';
	import ClauseComponent from '../ClauseComponent.svelte';
	import { fromJust } from './../../types/maybe.ts';
	import HeadTailComponent from './../HeadTailComponent.svelte';

	type ClauseToVisit = {
		clause: Clause;
		toVisit: boolean;
	};

	let clauses: Maybe<ClauseToVisit>[] = $derived.by(() => {
		let realClauses: Maybe<ClauseToVisit>[] = [];
		const occurrences: VisitingOccurrenceList = getCurrentOccurrences();
		// If the occurrences contain a preprocessing list, this means that the watches will also contain one and there is no need to check further, they should have the same content.
		if (isLeft(occurrences) || getSolverMachine().identify() !== 'twatch') {
			realClauses = unwrapEither(occurrences)
				.getOccurrences()
				.map((cRef) =>
					makeJust({
						clause: getClausePool().at(cRef),
						toVisit: true
					})
				);
		} else {
			const watches: VisitingWatchList = getCurrentWatch();
			if (isLeft(watches)) {
				logFatal('Point that should not be accessible');
			} else {
				const watchedCRefs: CRef[] = fromRight(watches).getCRefs();
				const complementaryCRefs: CRef[] = fromRight(occurrences).getOccurrences();
				realClauses = reorderCRefs(complementaryCRefs, watchedCRefs);
			}
		}
		return [makeNothing(), ...realClauses];
	});

	function reorderCRefs(complementary: CRef[], watchedCRefs: CRef[]): Maybe<ClauseToVisit>[] {
		// First let's create the a set of the watchedCRefs
		const watchedSet: Set<CRef> = new Set(watchedCRefs);

		// Then let's create a list of unwatched CRefs
		const unwatchedCRefs: CRef[] = [...complementary.filter((cRef) => !watchedSet.has(cRef))];

		const result: Maybe<ClauseToVisit>[] = [];

		// For each watch, we will add the CRefs that are not going to be visited that have a lower index.
		for (const watch of watchedCRefs) {
			// Each element form the unwatched list will be removed and added to the result list.
			while (unwatchedCRefs.length > 0 && unwatchedCRefs[0] < watch) {
				const unwatchedCRef: CRef = unwatchedCRefs.shift() as CRef;
				result.push(
					makeJust({
						clause: getClausePool().at(unwatchedCRef),
						toVisit: false
					})
				);
			}
			// Once all the CRefs that comes previous to the watched CRef, the watched CRef is added.
			result.push(
				makeJust({
					clause: getClausePool().at(watch),
					toVisit: true
				})
			);
		}
		// If all the watches have been added, the rest of the unwatchedCRefs are added.
		result.push(
			...unwatchedCRefs.map((cRef) =>
				makeJust({
					clause: getClausePool().at(cRef),
					toVisit: false
				})
			)
		);
		return result;
	}

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

	const currentOccurrenceList: Either<VisitingWatchList, VisitingOccurrenceList> = $derived(
		getSolverMachine().identify() === 'twatch'
			? makeLeft(getCurrentWatch())
			: makeRight(getCurrentOccurrences())
	);

	function currentCRefs(): CRef[] {
		if (isRight(currentOccurrenceList)) {
			return unwrapEither(fromRight(currentOccurrenceList)).getOccurrences();
		} else {
			const visitingWatches: VisitingWatchList = fromLeft(currentOccurrenceList);
			if (isLeft(visitingWatches)) {
				return fromLeft(visitingWatches).getOccurrences();
			} else {
				return fromRight(visitingWatches).getCRefs();
			}
		}
	}

	function currentPointer(): number {
		if (isLeft(currentOccurrenceList)) {
			return unwrapEither(fromLeft(currentOccurrenceList)).getPointer();
		} else {
			return unwrapEither(fromRight(currentOccurrenceList)).getPointer();
		}
	}

	function inspectingClause(clauseCRef: Maybe<ClauseToVisit>): boolean {
		return isJust(clauseCRef)
			? fromJust(clauseCRef).clause.getCRef() === currentCRefs()[currentPointer()]
			: currentPointer() === -1
				? true
				: false;
	}

	function visited(clause: Maybe<ClauseToVisit>): boolean {
		if (isJust(clause)) {
			const visitingClause: ClauseToVisit = fromJust(clause);
			if (!visitingClause.toVisit) {
				return false;
			} else {
				const cRefIndex: number = currentCRefs().indexOf(visitingClause.clause.getCRef());
				return cRefIndex <= currentPointer();
			}
		} else {
			return false;
		}
	}
</script>

<occurrence-list>
	{#each clauses as maybeClause, i (i)}
		<div class="occurrence-list-item">
			<HeadTailComponent display={inspectingClause(maybeClause)} verticalList={true}>
				<div class="enumerate" class:inspecting={inspectingClause(maybeClause)}>
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
					class:visited-clause={visited(maybeClause) &&
						isPartial(fromJust(maybeClause).clause) &&
						fromJust(maybeClause).toVisit}
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
