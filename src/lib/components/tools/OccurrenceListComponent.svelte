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

	const using2Watch: boolean = $derived(getSolverMachine().identify() === 'twatch');

	function followActive(node: HTMLElement, isActive: () => boolean) {
		$effect(() => {
			if (isActive()) {
				node.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		});
	}

	let clauses: Maybe<Clause>[] = $derived.by(() => {
		let clausesToVisit: Clause[] = [];
		const occurrences: VisitingOccurrenceList = getCurrentOccurrences();

		//If the occurrence list is a preprocessing list or if the 2-watch literals scheme is not being used, just inspect the occurrence list
		if (isLeft(occurrences) || !using2Watch) {
			clausesToVisit = unwrapEither(occurrences)
				.getOccurrences()
				.map((cRef) => getClausePool().at(cRef));
		} else {
			const watches: VisitingWatchList = getCurrentWatch();
			if (isLeft(watches)) {
				logFatal(
					'Unexpected preprocessing list',
					'This point is only accessible in the conflict detection state of two watch literals'
				);
			} else {
				const watchedCRefs: CRef[] = fromRight(watches).getCRefs();
				clausesToVisit = watchedCRefs.map((cRef) => getClausePool().at(cRef));
			}
		}

		return [makeNothing(), ...clausesToVisit.map(makeJust)];
	});

	const nonWatchedClauses: Clause[] = $derived.by(() => {
		const occurrences: VisitingOccurrenceList = getCurrentOccurrences();

		//If the occurrence list is a preprocessing list or if the 2-watch literals scheme is not being used, just inspect the occurrence list
		if (isLeft(occurrences) || !using2Watch) {
			return [];
		}
		const watches: VisitingWatchList = getCurrentWatch();
		const occurrencesCRefs: Set<CRef> = new Set<CRef>(unwrapEither(occurrences).getOccurrences());
		const watchedCRefs: Set<CRef> = new Set<CRef>(fromRight(watches).getCRefs());
		const nonWatchedCRefs: CRef[] = [...occurrencesCRefs.difference(watchedCRefs)];
		return nonWatchedCRefs.map((cRef) => getClausePool().at(cRef));
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

	const currentOccurrenceList: Either<VisitingWatchList, VisitingOccurrenceList> = $derived(
		using2Watch ? makeLeft(getCurrentWatch()) : makeRight(getCurrentOccurrences())
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

	function inspectingClause(clauseCRef: Maybe<Clause>): boolean {
		return isJust(clauseCRef)
			? fromJust(clauseCRef).getCRef() === currentCRefs()[currentPointer()]
			: currentPointer() === -1
				? true
				: false;
	}

	function visited(visitingClause: Clause): boolean {
		const cRefIndex: number = currentCRefs().indexOf(visitingClause.getCRef());
		return cRefIndex <= currentPointer();
	}
</script>

<division class:invisible={!using2Watch}
	>Watched clauses <span class:invisible={clauses.length - 1 <= 0}>: {clauses.length - 1}</span
	></division
>
<occurrence-list class:main-list={using2Watch}>
	{#each clauses as maybeClause, i (i)}
		<div class="occurrence-list-item" use:followActive={() => inspectingClause(maybeClause)}>
			<HeadTailComponent display={inspectingClause(maybeClause)} verticalList={true}>
				<div class="enumerate" class:inspecting={inspectingClause(maybeClause)}>
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
					class:visited-clause={visited(fromJust(maybeClause)) && isPartial(fromJust(maybeClause))}
				>
					<ClauseComponent clause={fromJust(maybeClause)} />
				</div>
			{/if}
		</div>
	{/each}
</occurrence-list>

<division class:invisible={!using2Watch}
	>Non watched clauses <span class:invisible={nonWatchedClauses.length === 0}
		>: {nonWatchedClauses.length}</span
	></division
>
{#if using2Watch}
	<occurrence-list class="secondary-list">
		{#each nonWatchedClauses as skippedClause, i (i)}
			<div class="occurrence-list-item">
				<div class="enumerate">
					<span>
						{skippedClause.getCRef()}.
					</span>
				</div>
				<div
					class="clause-highlighter willSkip"
					class:inspectedTrue={isSat(skippedClause)}
					class:inspectedFalse={isUnSat(skippedClause)}
				>
					<ClauseComponent clause={skippedClause} />
				</div>
			</div>
		{/each}
	</occurrence-list>
{/if}

<style>
	.main-list {
		height: 75%;
		overflow: scroll;
	}

	.secondary-list {
		height: 25%;
		overflow: scroll;
	}

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
		padding: 0rem 0.4rem;
	}

	.enumerate {
		width: var(--cref-width);
		height: var(--cref-width);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: right;
		opacity: var(--non-inspecting-opacity);
	}

	.inspecting {
		opacity: 1;
	}

	division {
		text-align: center;
		font-size: 12px;
		border-top: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
		padding: 2px;
	}
</style>
