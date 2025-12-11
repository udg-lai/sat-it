import Literal from '$lib/entities/Literal.svelte.ts';
import { conflictDetectionEventBus, toggleTrailViewEventBus } from '$lib/events/events.ts';
import {
	cleanClausesToCheck,
	getCheckedClause,
	incrementCheckingIndex
} from '$lib/states/occurrence-list.svelte.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type { Occurrences } from '../types.ts';
import type {
	DPLL_ALL_CLAUSES_CHECKED_FUN,
	DPLL_ALL_CLAUSES_CHECKED_INPUT,
	DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	DPLL_BACKTRACKING_FUN,
	DPLL_BACKTRACKING_INPUT,
	DPLL_CHECK_NON_DECISION_MADE_FUN,
	DPLL_CHECK_NON_DECISION_MADE_INPUT,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	DPLL_COMPLEMENTARY_OCCURRENCES_INPUT,
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT,
	DPLL_DECIDE_FUN,
	DPLL_DECIDE_INPUT,
	DPLL_DELETE_CLAUSE_FUN,
	DPLL_DELETE_CLAUSE_INPUT,
	DPLL_EMPTY_CLAUSE_FUN,
	DPLL_EMPTY_CLAUSE_INPUT,
	DPLL_EMPTY_OCCURRENCE_LISTS_FUN,
	DPLL_EMPTY_OCCURRENCE_LISTS_INPUT,
	DPLL_NEXT_CLAUSE_FUN,
	DPLL_NEXT_CLAUSE_INPUT,
	DPLL_PICK_CLAUSE_SET_FUN,
	DPLL_PICK_CLAUSE_SET_INPUT,
	DPLL_QUEUE_OCCURRENCE_LIST_FUN,
	DPLL_QUEUE_OCCURRENCE_LIST_INPUT,
	DPLL_UNIT_CLAUSE_FUN,
	DPLL_UNIT_CLAUSE_INPUT,
	DPLL_UNIT_CLAUSES_DETECTION_FUN,
	DPLL_UNIT_CLAUSES_DETECTION_INPUT,
	DPLL_UNIT_PROPAGATION_FUN,
	DPLL_UNIT_PROPAGATION_INPUT,
	DPLL_UNSTACK_CLAUSE_SET_INPUT,
	DPLL_UNSTACK_OCCURRENCE_LIST_FUN
} from './dpll-domain.svelte.ts';
import type { DPLL_SolverMachine } from './dpll-solver-machine.svelte.ts';
import type { DPLL_StateMachine } from './dpll-state-machine.svelte.ts';

/* exported transitions */

export const initialTransition = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.getStateMachine();
	ecTransition(stateMachine);
	if (stateMachine.onFinalState()) return;
	const occurrenceList: Set<CRef> = ucdTransition(stateMachine);
	afterComplementaryBlock(solver, stateMachine, 0, occurrenceList);
};

export const preConflictDetection = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.getStateMachine();
	const pendingConflict: Occurrences = solver.consultPostponed();
	const clauseSet: Set<number> = pendingConflict.occ;
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const analyzeClause = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.getStateMachine();
	const pendingConflict: Occurrences = solver.consultPostponed();
	const clauseSet: Set<number> = pendingConflict.occ;
	const clauseTag: number | undefined = getCheckedClause();
	if (clauseTag === undefined) {
		logFatal('Unexpected undefined in inspectedClause');
	}
	deleteClauseTransition(stateMachine, clauseSet, clauseTag);
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const decide = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.getStateMachine();
	const assignedLiteral: number = decideTransition(stateMachine);
	const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	afterComplementaryBlock(solver, stateMachine, assignedLiteral, complementaryClauses);
};

export const conflictiveState = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.getStateMachine();
	emptyClauseSetTransition(stateMachine, solver);
	const firstLevel: boolean = decisionLevelTransition(stateMachine);
	if (firstLevel) return;
	const assignedLiteral = backtrackingTransition(stateMachine);
	const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	afterComplementaryBlock(solver, stateMachine, assignedLiteral, complementaryClauses);
};

/* General non-exported transitions */

const afterComplementaryBlock = (
	solver: DPLL_SolverMachine,
	stateMachine: DPLL_StateMachine,
	assignment: Lit,
	occurrenceList: Set<number>
): void => {
	queueOccurrenceListTransition(
		stateMachine,
		solver,
		Literal.complementary(assignment),
		occurrenceList
	);
	const pendingClausesSet: boolean = checkPendingOccurrenceListsTransition(stateMachine, solver);
	if (!pendingClausesSet) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	pickClauseSetTransition(stateMachine, solver);
	if (!solver.isInAutoMode()) conflictDetectionEventBus.emit();
};

const conflictDetectionBlock = (
	solver: DPLL_SolverMachine,
	stateMachine: DPLL_StateMachine,
	clauseSet: Set<number>
): void => {
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clauseSet);
	if (allClausesChecked) {
		unstackOccurrenceListTransition(stateMachine, solver);
		const pendingOccurrenceLists: boolean = checkPendingOccurrenceListsTransition(
			stateMachine,
			solver
		);
		if (!pendingOccurrenceLists) {
			cleanClausesToCheck();
			allVariablesAssignedTransition(stateMachine);
			return;
		}
		pickClauseSetTransition(stateMachine, solver);
		return;
	}
	const nextCRef: CRef = nextClauseTransition(stateMachine, clauseSet);
	const isConflictive: boolean = conflictDetectionTransition(stateMachine, nextCRef);
	if (isConflictive) {
		// Attach the conflictive clause to the last trail
		getLatestTrail().attachConflictiveClause(getClausePool().at(nextCRef));
		toggleTrailViewEventBus.emit();
		return;
	}
	const unitClause: boolean = unitClauseTransition(stateMachine, nextCRef);
	if (!unitClause) return;
	const assignedLiteral: number = unitPropagationTransition(stateMachine, nextCRef);
	const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	queueOccurrenceListTransition(stateMachine, solver, -assignedLiteral, complementaryClauses);
};

/* Specific Transitions */

const ecTransition = (stateMachine: DPLL_StateMachine): void => {
	if (stateMachine.getActiveId() !== 0) {
		logFatal(
			'Fail Initial',
			'Trying to use initialTransition in a state that is not the initial one'
		);
	}
	const ecState = stateMachine.getActiveState() as NonFinalState<
		DPLL_EMPTY_CLAUSE_FUN,
		DPLL_EMPTY_CLAUSE_INPUT
	>;
	if (ecState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause state');
	} else {
		const result: boolean = ecState.run();
		if (result) {
			stateMachine.transition('unsat_state');
		} else {
			stateMachine.transition('unit_clauses_detection_state');
		}
	}
};

const ucdTransition = (stateMachine: DPLL_StateMachine): Set<number> => {
	const ucdState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_CLAUSES_DETECTION_FUN,
		DPLL_UNIT_CLAUSES_DETECTION_INPUT
	>;
	if (ucdState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const result: Set<number> = ucdState.run();
	stateMachine.transition('queue_occurrence_list_state');
	return result;
};

const allVariablesAssignedTransition = (stateMachine: DPLL_StateMachine): void => {
	const allVariablesAssignedState = stateMachine.getActiveState() as NonFinalState<
		DPLL_ALL_VARIABLES_ASSIGNED_FUN,
		DPLL_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (allVariablesAssignedState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const result: boolean = allVariablesAssignedState.run();
	if (result) stateMachine.transition('sat_state');
	else stateMachine.transition('decide_state');
};

const queueOccurrenceListTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine,
	variable: number,
	clauseSet: Set<number>
): void => {
	const queueOccurrenceListState = stateMachine.getActiveState() as NonFinalState<
		DPLL_QUEUE_OCCURRENCE_LIST_FUN,
		DPLL_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (queueOccurrenceListState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Queue Occurrence List state'
		);
	}
	const size: number = queueOccurrenceListState.run(variable, clauseSet, solver);
	if (size > 1) stateMachine.transition('delete_clause_state');
	else stateMachine.transition('check_pending_occurrence_lists_state');
};

const checkPendingOccurrenceListsTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): boolean => {
	const checkPendingOccurrenceListsState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
		DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	>;
	if (checkPendingOccurrenceListsState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Pending Occurrence Lists state'
		);
	}
	const result: boolean = checkPendingOccurrenceListsState.run(solver);
	if (result) stateMachine.transition('pick_clause_set_state');
	else stateMachine.transition('all_variables_assigned_state');
	return result;
};

const pickClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): Set<number> => {
	const pickClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_PICK_CLAUSE_SET_FUN,
		DPLL_PICK_CLAUSE_SET_INPUT
	>;
	if (pickClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	const result: Set<number> = pickClauseSetState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};

const allClausesCheckedTransition = (
	stateMachine: DPLL_StateMachine,
	clauses: Set<number>
): boolean => {
	const allClausesCheckedState = stateMachine.getActiveState() as NonFinalState<
		DPLL_ALL_CLAUSES_CHECKED_FUN,
		DPLL_ALL_CLAUSES_CHECKED_INPUT
	>;
	if (allClausesCheckedState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the All Clauses Checked state');
	}
	const result: boolean = allClausesCheckedState.run(clauses);
	if (result) stateMachine.transition('unstack_clause_set_state');
	else stateMachine.transition('next_occurrence_state');
	return result;
};

const nextClauseTransition = (stateMachine: DPLL_StateMachine, clauseSet: Set<number>): number => {
	const nextClauseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_NEXT_CLAUSE_FUN,
		DPLL_NEXT_CLAUSE_INPUT
	>;
	if (nextClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseTag: number = nextClauseState.run(clauseSet);
	stateMachine.transition('conflict_detection_state');
	return clauseTag;
};

const conflictDetectionTransition = (
	stateMachine: DPLL_StateMachine,
	clauseTag: number
): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CONFLICT_DETECTION_FUN,
		DPLL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseTag);
	if (result) stateMachine.transition('empty_occurrence_lists_state');
	else stateMachine.transition('unit_clause_state');
	return result;
};

const decisionLevelTransition = (stateMachine: DPLL_StateMachine): boolean => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CHECK_NON_DECISION_MADE_FUN,
		DPLL_CHECK_NON_DECISION_MADE_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const onLevelZero: boolean = decisionLevelState.run();
	if (onLevelZero) stateMachine.transition('unsat_state');
	else stateMachine.transition('backtracking_state');
	return onLevelZero;
};

const unitClauseTransition = (stateMachine: DPLL_StateMachine, clauseTag: number): boolean => {
	const unitClauseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_CLAUSE_FUN,
		DPLL_UNIT_CLAUSE_INPUT
	>;
	if (unitClauseState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const result: boolean = unitClauseState.run(clauseTag);
	if (result) stateMachine.transition('unit_propagation_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const deleteClauseTransition = (
	stateMachine: DPLL_StateMachine,
	clauseSet: Set<number>,
	clauseTag: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_DELETE_CLAUSE_FUN,
		DPLL_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(clauseSet, clauseTag);
	stateMachine.transition('all_clauses_checked_state');
	incrementCheckingIndex();
};

const unstackOccurrenceListTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): void => {
	const unstackOccurrenceListSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
		DPLL_UNSTACK_CLAUSE_SET_INPUT
	>;
	if (unstackOccurrenceListSetState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unstack Occurrence List state'
		);
	}
	unstackOccurrenceListSetState.run(solver);
	stateMachine.transition('check_pending_occurrence_lists_state');
};

const unitPropagationTransition = (stateMachine: DPLL_StateMachine, clauseTag: number): number => {
	const unitPropagationState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_PROPAGATION_FUN,
		DPLL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const literalToPropagate: number = unitPropagationState.run(clauseTag);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const complementaryOccurrencesTransition = (
	stateMachine: DPLL_StateMachine,
	literalToPropagate: number
): Set<number> => {
	const complementaryOccurrencesState = stateMachine.getActiveState() as NonFinalState<
		DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
		DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (complementaryOccurrencesState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: Set<number> = complementaryOccurrencesState.run(literalToPropagate);
	stateMachine.transition('queue_occurrence_list_state');
	return clauses;
};

const decideTransition = (stateMachine: DPLL_StateMachine): number => {
	const decideState = stateMachine.getActiveState() as NonFinalState<
		DPLL_DECIDE_FUN,
		DPLL_DECIDE_INPUT
	>;
	if (decideState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const literalToPropagate: number = decideState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const backtrackingTransition = (stateMachine: DPLL_StateMachine): number => {
	const backtrackingState = stateMachine.getActiveState() as NonFinalState<
		DPLL_BACKTRACKING_FUN,
		DPLL_BACKTRACKING_INPUT
	>;
	if (backtrackingState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const literalToPropagate: number = backtrackingState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const emptyClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_EMPTY_OCCURRENCE_LISTS_FUN,
		DPLL_EMPTY_OCCURRENCE_LISTS_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};
