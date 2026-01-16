import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { conflictDetectionEventBus } from '$lib/events/events.ts';
import { getOccurrenceList, updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { makeJust, makeNothing } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	DPLL_AT_LEVEL_ZERO_FUN,
	DPLL_AT_LEVEL_ZERO_INPUT,
	DPLL_BACKTRACKING_FUN,
	DPLL_BACKTRACKING_INPUT,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	DPLL_COMPLEMENTARY_OCCURRENCES_INPUT,
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT,
	DPLL_DECIDE_FUN,
	DPLL_DECIDE_INPUT,
	DPLL_NEXT_OCCURRENCE_FUN,
	DPLL_NEXT_OCCURRENCE_INPUT,
	DPLL_PICK_OCCURRENCE_LIST_FUN,
	DPLL_PICK_OCCURRENCE_LIST_INPUT,
	DPLL_QUEUE_OCCURRENCE_LIST_FUN,
	DPLL_QUEUE_OCCURRENCE_LIST_INPUT,
	DPLL_TRAVERSED_OCCURRENCE_LIST_FUN,
	DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT,
	DPLL_UNIT_CLAUSE_FUN,
	DPLL_UNIT_CLAUSE_INPUT,
	DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	DPLL_UNIT_PROPAGATION_FUN,
	DPLL_UNIT_PROPAGATION_INPUT,
	DPLL_UNSTACK_CLAUSE_SET_INPUT,
	DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
	DPLL_WIPE_OCCURRENCE_QUEUE_FUN,
	DPLL_WIPE_OCCURRENCE_QUEUE_INPUT
} from './dpll-domain.svelte.ts';

/* exported transitions */

export const initialTransition = (): void => {
	const unaryEmptyCRefs: Set<CRef> = unaryEmptyClausesTransition();
	const occurrenceList: OccurrenceList = new OccurrenceList(makeNothing(), [...unaryEmptyCRefs]);
	afterComplementaryBlock(occurrenceList);
};

export const decide = (): void => {
	const assignment: Lit = decideTransition();
	const occurrenceList: OccurrenceList = complementaryOccurrencesTransition(assignment);
	afterComplementaryBlock(occurrenceList);
};

export const conflictDetectionBlock = (): void => {
	const traversedOccurrenceList: boolean = traversedOccurrenceListTransition();
	if (traversedOccurrenceList) {
		dequeueOccurrenceListTransition();
		const pendingOcc: boolean = checkPendingOccurrenceListsTransition();
		if (pendingOcc) {
			pickOccurrenceListTransition();
		} else {
			updateOccurrenceList(new OccurrenceList());
			allVariablesAssignedTransition();
		}
	} else {
		const cRef: CRef = nextOccurrenceTransition();
		const isConflictive: boolean = conflictDetectionTransition(cRef);
		if (isConflictive) {
			getLatestTrail().attachConflictiveClause(getClausePool().at(cRef));
			getLatestTrail().showCtx();
		} else {
			const unitClause: boolean = unitClauseTransition(cRef);
			if (unitClause) {
				const propagated: Lit = unitPropagationTransition(cRef);
				const occurrenceList: OccurrenceList = complementaryOccurrencesTransition(propagated);
				queueOccurrenceListTransition(occurrenceList);
			}
		}
	}
};

export const conflictiveState = (): void => {
	wipeOccurrenceQueueTransition();
	const atLevelZero: boolean = dlZeroTransition();
	if (!atLevelZero) {
		const assignment = backtrackingTransition();
		const occurrenceList: OccurrenceList = complementaryOccurrencesTransition(assignment);
		afterComplementaryBlock(occurrenceList);
	}
};

/* General non-exported transitions */

const afterComplementaryBlock = (occurrenceList: OccurrenceList): void => {
	queueOccurrenceListTransition(occurrenceList);
	const thereAreOccurrences: boolean = checkPendingOccurrenceListsTransition();
	if (thereAreOccurrences) {
		pickOccurrenceListTransition();
	} else {
		allVariablesAssignedTransition();
	}
	// This is for showing the up-1 and up-n view
	if (!getSolverMachine().runningOnAutomatic()) conflictDetectionEventBus.emit();
};

/* Specific Transitions */
const unaryEmptyClausesTransition = (): Set<CRef> => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
		DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unary Clause Detection state'
		);
	}
	const unaryEmptyCRefs: Set<CRef> = state.run();
	getSolverMachine().transition('queue_occurrence_list_state');
	return unaryEmptyCRefs;
};

const allVariablesAssignedTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_ALL_VARIABLES_ASSIGNED_FUN,
		DPLL_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const allAssigned: boolean = state.run();
	if (allAssigned) getSolverMachine().transition('sat_state');
	else getSolverMachine().transition('decide_state');
};

const queueOccurrenceListTransition = (occurrenceList: OccurrenceList): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_QUEUE_OCCURRENCE_LIST_FUN,
		DPLL_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Queue Occurrence List state'
		);
	}
	state.run(occurrenceList);
	// NOTE: This transition is being used in two places in the dpll solver diagram.
	const queueSize = getOccurrenceListQueue().size();
	if (queueSize > 1) {
		// This means, we came from UP and complementary occurrence detection
		getSolverMachine().transition('traversed_occurrences_state');
	} else if (queueSize === 1) {
		// This means we came from initial UPs or decide transitions
		getSolverMachine().transition('are_remaining_occurrences_state');
	} else {
		logFatal('DPLL Solver Transition Error', "Occurrences Queue shouldn't be empty here");
	}
};

const checkPendingOccurrenceListsTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
		DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Pending Occurrence Lists state'
		);
	}
	const pendingOcc: boolean = state.run();
	if (pendingOcc) getSolverMachine().transition('pick_occurrence_list_state');
	else getSolverMachine().transition('all_variables_assigned_state');
	return pendingOcc;
};

const pickOccurrenceListTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_PICK_OCCURRENCE_LIST_FUN,
		DPLL_PICK_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	state.run();
	getSolverMachine().transition('all_clauses_checked_state');
};

const traversedOccurrenceListTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_TRAVERSED_OCCURRENCE_LIST_FUN,
		DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT
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

const nextOccurrenceTransition = (): CRef => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_NEXT_OCCURRENCE_FUN,
		DPLL_NEXT_OCCURRENCE_INPUT
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
		DPLL_CONFLICT_DETECTION_FUN,
		DPLL_CONFLICT_DETECTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const conflict: boolean = state.run(cRef);
	if (conflict) getSolverMachine().transition('wipe_occurrence_queue_state');
	else getSolverMachine().transition('unit_clause_state');
	return conflict;
};

const dlZeroTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_AT_LEVEL_ZERO_FUN,
		DPLL_AT_LEVEL_ZERO_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const onLevelZero: boolean = state.run();
	if (onLevelZero) getSolverMachine().transition('unsat_state');
	else getSolverMachine().transition('backtracking_state');
	return onLevelZero;
};

const unitClauseTransition = (clauseTag: CRef): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_UNIT_CLAUSE_FUN,
		DPLL_UNIT_CLAUSE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const unit: boolean = state.run(clauseTag);
	if (unit) getSolverMachine().transition('unit_propagation_state');
	else getSolverMachine().transition('traversed_occurrences_state');
	return unit;
};

const dequeueOccurrenceListTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
		DPLL_UNSTACK_CLAUSE_SET_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unstack Occurrence List state'
		);
	}
	state.run();
	getSolverMachine().transition('are_remaining_occurrences_state');
};

const unitPropagationTransition = (cRef: CRef): number => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_UNIT_PROPAGATION_FUN,
		DPLL_UNIT_PROPAGATION_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const propagated: Lit = state.run(cRef);
	getSolverMachine().transition('complementary_occurrences_state');
	return propagated;
};

const complementaryOccurrencesTransition = (assignment: Lit): OccurrenceList => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
		DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const cRefs: Set<CRef> = state.run(assignment);
	getSolverMachine().transition('queue_occurrence_list_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new OccurrenceList(makeJust(complementary), [...cRefs]);
};

const decideTransition = (): number => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_DECIDE_FUN,
		DPLL_DECIDE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const assignment: Lit = state.run();
	getSolverMachine().transition('complementary_occurrences_state');
	return assignment;
};

const backtrackingTransition = (): Lit => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_BACKTRACKING_FUN,
		DPLL_BACKTRACKING_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const assignment: Lit = state.run();
	getSolverMachine().transition('complementary_occurrences_state');
	return assignment;
};

const wipeOccurrenceQueueTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		DPLL_WIPE_OCCURRENCE_QUEUE_FUN,
		DPLL_WIPE_OCCURRENCE_QUEUE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	state.run();
	getSolverMachine().transition('at_level_zero_state');
};
