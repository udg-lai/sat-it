import { logFatal } from '$lib/stores/toasts.ts';
import type { NonFinalState } from '../StateMachine.svelte.ts';
import type {
	BKT_ALL_CLAUSES_CHECKED_FUN,
	BKT_ALL_CLAUSES_CHECKED_INPUT,
	BKT_ALL_VARIABLES_ASSIGNED_FUN,
	BKT_ALL_VARIABLES_ASSIGNED_INPUT,
	BKT_BACKTRACKING_FUN,
	BKT_BACKTRACKING_INPUT,
	BKT_COMPLEMENTARY_OCCURRENCES_FUN,
	BKT_COMPLEMENTARY_OCCURRENCES_INPUT,
	BKT_CONFLICT_DETECTION_FUN,
	BKT_CONFLICT_DETECTION_INPUT,
	BKT_DECIDE_FUN,
	BKT_DECIDE_INPUT,
	BKT_DECISION_LEVEL_FUN,
	BKT_DECISION_LEVEL_INPUT,
	BKT_DELETE_CLAUSE_FUN,
	BKT_DELETE_CLAUSE_INPUT,
	BKT_EMPTY_CLAUSE_FUN,
	BKT_EMPTY_CLAUSE_INPUT,
	BKT_EMPTY_PENDING_OCCURRENCE_LIST_FUN,
	BKT_EMPTY_PENDING_OCCURRENCE_LIST_INPUT,
	BKT_NEXT_CLAUSE_FUN,
	BKT_NEXT_CLAUSE_INPUT,
	BKT_PICK_PENDING_CLAUSE_SET_FUN,
	BKT_PENDING_OCCURRENCE_LIST_INPUT,
	BKT_QUEUE_OCCURRENCE_LIST_FUN,
	BKT_QUEUE_OCCURRENCE_LIST_INPUT
} from './bkt-domain.svelte.ts';
import type { BKT_SolverMachine } from './bkt-solver-machine.svelte.ts';
import type { BKT_StateMachine } from './bkt-state-machine.svelte.ts';
import { updateLastTrailEnding } from '$lib/states/trails.svelte.ts';
import {
	getCheckedClause,
	incrementCheckingIndex,
	updateClausesToCheck
} from '$lib/states/conflict-detection-state.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { conflictDetectionEventBus } from '$lib/events/events.ts';
import type { OccurrenceList } from '../types.ts';

/* exported transitions */

export const initialTransition = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.getStateMachine();
	ecTransition(stateMachine);
	if (stateMachine.onFinalState()) return;
	allVariablesAssignedTransition(stateMachine);
};

export const preConflictDetection = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.getStateMachine();
	const pendingOccurrenceList: OccurrenceList = solver.consultOccurrenceList();
	const pendingClauses: SvelteSet<number> = pendingOccurrenceList.clauses;
	conflictDetectionBlock(stateMachine, pendingClauses);
};

export const analyzeClause = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.getStateMachine();
	const pendingOccurrenceList: OccurrenceList = solver.consultOccurrenceList();
	const pendingClauses: SvelteSet<number> = pendingOccurrenceList.clauses;
	const clauseId: number = getCheckedClause();
	deleteClauseTransition(stateMachine, pendingClauses, clauseId);
	conflictDetectionBlock(stateMachine, pendingClauses);
};

export const decide = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.getStateMachine();
	const literalToPropagate: number = decideTransition(stateMachine);
	afterAssignmentBlock(solver, stateMachine, Math.abs(literalToPropagate), literalToPropagate);
};

export const backtracking = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.getStateMachine();
	emptyPendingSetTransition(stateMachine, solver);
	const firstLevel: boolean = decisionLevelTransition(stateMachine);
	if (firstLevel) return;
	const literalToPropagate = backtrackingTransition(stateMachine);

	afterAssignmentBlock(solver, stateMachine, Math.abs(literalToPropagate), literalToPropagate);
};

const afterAssignmentBlock = (
	solver: BKT_SolverMachine,
	stateMachine: BKT_StateMachine,
	variable: number,
	literalToPropagate: number
): void => {
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	queueOccurrenceListTransition(stateMachine, solver, variable, complementaryClauses);
	pickPendingOccurrenceListTransition(stateMachine, solver);
	if(!solver.isInAutoMode()) conflictDetectionEventBus.emit();
};

const conflictDetectionBlock = (
	stateMachine: BKT_StateMachine,
	pendingClauses: SvelteSet<number>
) => {
	const allChecked: boolean = allClausesCheckedTransition(stateMachine, pendingClauses);
	if (allChecked) {
		updateClausesToCheck(new SvelteSet<number>(), -1);
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	const clauseId: number = nextClauseTransition(stateMachine, pendingClauses);
	const conflict: boolean = conflictDetectionTransition(stateMachine, clauseId);
	if (conflict) {
		updateLastTrailEnding(clauseId);
		return;
	}
};

const ecTransition = (stateMachine: BKT_StateMachine): void => {
	if (stateMachine.getActiveId() !== 0) {
		logFatal(
			'Fail Initial',
			'Trying to use initialTransition in a state that is not the initial one'
		);
	}
	const ecState = stateMachine.getActiveState() as NonFinalState<
		BKT_EMPTY_CLAUSE_FUN,
		BKT_EMPTY_CLAUSE_INPUT
	>;
	if (ecState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause state');
	}
	const result: boolean = ecState.run();
	if (result) stateMachine.transition('unsat_state');
	else stateMachine.transition('all_variables_assigned_state');
};

const allVariablesAssignedTransition = (stateMachine: BKT_StateMachine): void => {
	const allVariablesAssignedState = stateMachine.getActiveState() as NonFinalState<
		BKT_ALL_VARIABLES_ASSIGNED_FUN,
		BKT_ALL_VARIABLES_ASSIGNED_INPUT
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

const nextClauseTransition = (
	stateMachine: BKT_StateMachine,
	pendingSet: SvelteSet<number>
): number => {
	const nextClauseState = stateMachine.getActiveState() as NonFinalState<
		BKT_NEXT_CLAUSE_FUN,
		BKT_NEXT_CLAUSE_INPUT
	>;
	if (nextClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseId: number = nextClauseState.run(pendingSet);
	stateMachine.transition('conflict_detection_state');
	return clauseId;
};

const conflictDetectionTransition = (stateMachine: BKT_StateMachine, clauseId: number): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		BKT_CONFLICT_DETECTION_FUN,
		BKT_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseId);
	if (result) stateMachine.transition('empty_pending_occurrence_list_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const emptyPendingSetTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		BKT_EMPTY_PENDING_OCCURRENCE_LIST_FUN,
		BKT_EMPTY_PENDING_OCCURRENCE_LIST_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};

const decisionLevelTransition = (stateMachine: BKT_StateMachine): boolean => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<
		BKT_DECISION_LEVEL_FUN,
		BKT_DECISION_LEVEL_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const result: boolean = decisionLevelState.run();
	if (result) stateMachine.transition('unsat_state');
	else stateMachine.transition('backtracking_state');
	return result;
};

const deleteClauseTransition = (
	stateMachine: BKT_StateMachine,
	pendingSet: SvelteSet<number>,
	clauseId: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		BKT_DELETE_CLAUSE_FUN,
		BKT_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(pendingSet, clauseId);
	stateMachine.transition('all_clauses_checked_state');
	incrementCheckingIndex();
};

const allClausesCheckedTransition = (
	stateMachine: BKT_StateMachine,
	pendingSet: SvelteSet<number>
): boolean => {
	const allClausesCheckedState = stateMachine.getActiveState() as NonFinalState<
		BKT_ALL_CLAUSES_CHECKED_FUN,
		BKT_ALL_CLAUSES_CHECKED_INPUT
	>;
	if (allClausesCheckedState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the All Clauses Checked state');
	}
	const result: boolean = allClausesCheckedState.run(pendingSet);
	if (result) stateMachine.transition('all_variables_assigned_state');
	else stateMachine.transition('next_clause_state');
	return result;
};

const decideTransition = (stateMachine: BKT_StateMachine): number => {
	const decideState = stateMachine.getActiveState() as NonFinalState<
		BKT_DECIDE_FUN,
		BKT_DECIDE_INPUT
	>;
	if (decideState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const literalToPropagate: number = decideState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const backtrackingTransition = (stateMachine: BKT_StateMachine): number => {
	const backtrackingState = stateMachine.getActiveState() as NonFinalState<
		BKT_BACKTRACKING_FUN,
		BKT_BACKTRACKING_INPUT
	>;
	if (backtrackingState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Backtracking state');
	}
	const literalToPropagate: number = backtrackingState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const complementaryOccurrencesTransition = (
	stateMachine: BKT_StateMachine,
	literalToPropagate: number
): SvelteSet<number> => {
	const complementaryOccurrencesState = stateMachine.getActiveState() as NonFinalState<
		BKT_COMPLEMENTARY_OCCURRENCES_FUN,
		BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (complementaryOccurrencesState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: SvelteSet<number> = complementaryOccurrencesState.run(literalToPropagate);
	stateMachine.transition('queue_occurrence_list_state');
	return clauses;
};

const queueOccurrenceListTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine,
	variable: number,
	clauseSet: SvelteSet<number>
): void => {
	const queueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		BKT_QUEUE_OCCURRENCE_LIST_FUN,
		BKT_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (queueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause Set state');
	}
	queueClauseSetState.run(variable, clauseSet, solver);
	stateMachine.transition('pick_pending_occurrence_list_state');
};

const pickPendingOccurrenceListTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine
): SvelteSet<number> => {
	const pickPendingOccurrenceListState = stateMachine.getActiveState() as NonFinalState<
		BKT_PICK_PENDING_CLAUSE_SET_FUN,
		BKT_PENDING_OCCURRENCE_LIST_INPUT
	>;
	if (pickPendingOccurrenceListState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Pending Set state');
	}
	const result: SvelteSet<number> = pickPendingOccurrenceListState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};
