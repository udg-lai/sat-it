import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import {
	conflictAnalysisFinishedEventBus,
	conflictDetectedEventBus,
	visitingComplementaryOccEventBus
} from '$lib/events/events.ts';
import { getClausePool, getOccurrenceList } from '$lib/states/problem.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { makeJust, makeNothing } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type { NonFinalState } from '../StateMachine.svelte.ts';
import type {
	BKT_ALL_VARIABLES_ASSIGNED_FUN,
	BKT_ALL_VARIABLES_ASSIGNED_INPUT,
	BKT_AT_LEVEL_ZERO_FUN,
	BKT_AT_LEVEL_ZERO_INPUT,
	BKT_BACKTRACKING_FUN,
	BKT_BACKTRACKING_INPUT,
	BKT_COMPLEMENTARY_OCCURRENCES_FUN,
	BKT_COMPLEMENTARY_OCCURRENCES_INPUT,
	BKT_CONFLICT_DETECTION_FUN,
	BKT_CONFLICT_DETECTION_INPUT,
	BKT_DECIDE_FUN,
	BKT_DECIDE_INPUT,
	BKT_DEQUEUE_OCCURRENCE_LIST_FUN,
	BKT_DEQUEUE_OCCURRENCE_LIST_INPUT,
	BKT_EMPTY_CLAUSES_DETECTION_FUN,
	BKT_EMPTY_CLAUSES_DETECTION_INPUT,
	BKT_NEXT_OCCURRENCE_FUN,
	BKT_NEXT_OCCURRENCE_INPUT,
	BKT_QUEUE_OCCURRENCE_LIST_FUN,
	BKT_QUEUE_OCCURRENCE_LIST_INPUT,
	BKT_TRAVERSED_OCCURRENCE_LIST_FUN,
	BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
} from './bkt-domain.svelte.ts';

/* exported transitions */

export const initialTransition = (): void => {
	const emptyCRefs: Set<CRef> = ecTransition();
	const occurrenceList: OccurrenceList = new OccurrenceList(makeNothing(), [...emptyCRefs]);
	queueOccurrenceListTransition(occurrenceList);

	// This is for showing the up-1 and up-n view
	if (!getSolverMachine().runningOnAutomatic()) visitingComplementaryOccEventBus.emit();
};

export const decide = (): void => {
	const assignment: Lit = decideTransition();
	afterAssignmentBlock(assignment);
};

export const backtracking = (): void => {
	dequeueOccurrenceListTransition(true);
	if (!dlZeroCheck()) {
		const assignment: Lit = backtrackingTransition();
		afterAssignmentBlock(assignment);
	}
	conflictAnalysisFinishedEventBus.emit();
};

const afterAssignmentBlock = (assignment: Lit): void => {
	const occurrenceList: OccurrenceList = complementaryOccurrencesTransition(assignment);
	queueOccurrenceListTransition(occurrenceList);

	if (!getSolverMachine().runningOnAutomatic()) visitingComplementaryOccEventBus.emit();
};

export const conflictDetectionBlock = () => {
	const traversed: boolean = traversedOccurrenceListTransition();
	if (traversed) {
		dequeueOccurrenceListTransition(false);
		allVariablesAssignedTransition();
		return;
	}
	const cRef: CRef = nextClauseTransition();
	const isConflictive: boolean = conflictDetectionTransition(cRef);
	if (isConflictive) {
		getLatestTrail().attachConflictiveClause(getClausePool().at(cRef));
		conflictDetectedEventBus.emit();
	}
};

const ecTransition = (): Set<CRef> => {
	if (getSolverMachine().getActiveStateId() !== 0) {
		logFatal(
			'Fail Initial',
			'Trying to use initialTransition in a state that is not the initial one'
		);
	}
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_EMPTY_CLAUSES_DETECTION_FUN,
		BKT_EMPTY_CLAUSES_DETECTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause state');
	}
	const emptyCRefs: Set<CRef> = state.run();
	getSolverMachine().transition('queue_occurrence_list_state');
	return emptyCRefs;
};

const allVariablesAssignedTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_ALL_VARIABLES_ASSIGNED_FUN,
		BKT_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const result: boolean = state.run();
	if (result) getSolverMachine().transition('sat_state');
	else getSolverMachine().transition('decide_state');
};

const nextClauseTransition = (): CRef => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_NEXT_OCCURRENCE_FUN,
		BKT_NEXT_OCCURRENCE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const cRef: CRef = state.run();
	getSolverMachine().transition('falsified_clause_state');
	return cRef;
};

const conflictDetectionTransition = (cRef: CRef): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_CONFLICT_DETECTION_FUN,
		BKT_CONFLICT_DETECTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const falsified: boolean = state.run(cRef);
	if (falsified) getSolverMachine().transition('dequeue_occurrence_list_state');
	else getSolverMachine().transition('traversed_occurrences_state');
	return falsified;
};

const dequeueOccurrenceListTransition = (fromConflict: boolean): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_DEQUEUE_OCCURRENCE_LIST_FUN,
		BKT_DEQUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Dequeue Occurrence List state'
		);
	}
	state.run();
	if (fromConflict) getSolverMachine().transition('at_level_zero_state');
	else getSolverMachine().transition('all_variables_assigned_state');
};

const dlZeroCheck = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_AT_LEVEL_ZERO_FUN,
		BKT_AT_LEVEL_ZERO_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const result: boolean = state.run();
	if (result) getSolverMachine().transition('unsat_state');
	else getSolverMachine().transition('backtracking_state');
	return result;
};

const traversedOccurrenceListTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_TRAVERSED_OCCURRENCE_LIST_FUN,
		BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the All Clauses Checked state');
	}
	const occurrenceList: OccurrenceList = getOccurrenceList();
	const traversed: boolean = state.run(occurrenceList);
	if (traversed) getSolverMachine().transition('dequeue_occurrence_list_state');
	else getSolverMachine().transition('next_clause_state');
	return traversed;
};

const decideTransition = (): Lit => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_DECIDE_FUN,
		BKT_DECIDE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const decision: Lit = state.run();
	getSolverMachine().transition('complementary_occurrences_state');
	return decision;
};

const backtrackingTransition = (): Lit => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_BACKTRACKING_FUN,
		BKT_BACKTRACKING_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Backtracking state');
	}
	const assignment: Lit = state.run();
	getSolverMachine().transition('complementary_occurrences_state');
	return assignment;
};

const complementaryOccurrencesTransition = (assignment: Lit): OccurrenceList => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_COMPLEMENTARY_OCCURRENCES_FUN,
		BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: Set<CRef> = state.run(assignment);
	getSolverMachine().transition('queue_occurrence_list_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new OccurrenceList(makeJust(complementary), [...clauses]);
};

const queueOccurrenceListTransition = (occurrenceList: OccurrenceList): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		BKT_QUEUE_OCCURRENCE_LIST_FUN,
		BKT_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause List state');
	}
	state.run(occurrenceList);
	getSolverMachine().transition('traversed_occurrences_state');
};
