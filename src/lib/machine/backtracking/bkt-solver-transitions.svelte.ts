import { logFatal } from '$lib/store/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';
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
	BKT_EMPTY_PENDING_SET_FUN,
	BKT_EMPTY_PENDING_SET_INPUT,
	BKT_NEXT_CLAUSE_FUN,
	BKT_NEXT_CLAUSE_INPUT,
	BKT_PICK_PENDING_SET_FUN,
	BKT_PICK_PENDING_SET_INPUT,
	BKT_QUEUE_CLAUSE_SET_FUN,
	BKT_QUEUE_CLAUSE_SET_INPUT,
	BKT_TRIGGERED_CLAUSES_FUN,
	BKT_TRIGGERED_CLAUSES_INPUT
} from './bkt-domain.svelte.ts';
import type { BKT_SolverMachine } from './bkt-solver-machine.svelte.ts';
import type { BKT_StateMachine } from './bkt-state-machine.svelte.ts';
import { updateLastTrailEnding } from '$lib/store/trails.svelte.ts';
import {
	incrementCheckingIndex,
	updateClausesToCheck
} from '$lib/store/conflict-detection-state.svelte.ts';
import type { PendingItem } from '../SolverMachine.svelte.ts';

export const initialTransition = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
	ecTransition(stateMachine);
	if (stateMachine.onFinalState()) return;
	allVariablesAssignedTransition(stateMachine);
};

export const analyzeClause = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
	const pendingItem: PendingItem = solver.consultPending();
	const pendingSet: SvelteSet<number> = pendingItem.clauseSet;
	const clauseId: number = nextClauseTransition(stateMachine, pendingSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine, clauseId);
	if (conflict) {
		updateLastTrailEnding(clauseId);
		emptyPendingSetTransition(stateMachine, solver);
		decisionLevelTransition(stateMachine);
		return;
	}
	deleteClauseTransition(stateMachine, pendingSet, clauseId);
	const allChecked: boolean = allClausesCheckedTransition(stateMachine, pendingSet);
	if (!allChecked) return;
	updateClausesToCheck(new SvelteSet<number>(), -1);
	allVariablesAssignedTransition(stateMachine);
};

export const decide = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
	const literalToPropagate: number = decideTransition(stateMachine);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};

export const backtracking = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
	const literalToPropagate = backtrackingTransition(stateMachine);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};

const conflictDetectionBlock = (
	solver: BKT_SolverMachine,
	stateMachine: BKT_StateMachine,
	variable: number,
	complementaryClauses: SvelteSet<number>
): void => {
	const triggeredClauses: boolean = triggeredClausesTransition(stateMachine, complementaryClauses);
	if (!triggeredClauses) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	queueClauseSetTransition(stateMachine, solver, variable, complementaryClauses);
	const pendingSet: SvelteSet<number> = pickPendingSetTransition(stateMachine, solver);
	const allChecked: boolean = allClausesCheckedTransition(stateMachine, pendingSet);
	if (allChecked) {
		logFatal('This is not a possibility in this case');
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
	const nextCluaseState = stateMachine.getActiveState() as NonFinalState<
		BKT_NEXT_CLAUSE_FUN,
		BKT_NEXT_CLAUSE_INPUT
	>;
	if (nextCluaseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseId: number = nextCluaseState.run(pendingSet);
	incrementCheckingIndex();
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
	if (result) stateMachine.transition('empty_pending_set_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const emptyPendingSetTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		BKT_EMPTY_PENDING_SET_FUN,
		BKT_EMPTY_PENDING_SET_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};

const decisionLevelTransition = (stateMachine: BKT_StateMachine): void => {
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
		logFatal('Function call error', 'There should be a function in the All Clausees Checked state');
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
		logFatal('Function call error', 'There should be a function in the Decide state');
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
	stateMachine.transition('triggered_clauses_state');
	return clauses;
};

const triggeredClausesTransition = (
	stateMachine: BKT_StateMachine,
	complementaryClauses: SvelteSet<number>
): boolean => {
	const triggeredClausesState = stateMachine.getActiveState() as NonFinalState<
		BKT_TRIGGERED_CLAUSES_FUN,
		BKT_TRIGGERED_CLAUSES_INPUT
	>;
	if (triggeredClausesState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Triggered Clauses state');
	}
	const result: boolean = triggeredClausesState.run(complementaryClauses);
	if (result) stateMachine.transition('queue_clause_set_state');
	else stateMachine.transition('all_variables_assigned_state');
	return result;
};

const queueClauseSetTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine,
	variable: number,
	clauseSet: SvelteSet<number>
): void => {
	const queueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		BKT_QUEUE_CLAUSE_SET_FUN,
		BKT_QUEUE_CLAUSE_SET_INPUT
	>;
	if (queueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause Set state');
	}
	queueClauseSetState.run(variable, clauseSet, solver);
	stateMachine.transition('pick_pending_set_state');
};

const pickPendingSetTransition = (
	stateMachine: BKT_StateMachine,
	solver: BKT_SolverMachine
): SvelteSet<number> => {
	const pickClauseSetState = stateMachine.getActiveState() as NonFinalState<
		BKT_PICK_PENDING_SET_FUN,
		BKT_PICK_PENDING_SET_INPUT
	>;
	if (pickClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Pending Set state');
	}
	const result: SvelteSet<number> = pickClauseSetState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};
