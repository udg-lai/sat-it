import { logFatal } from '$lib/transversal/logging.ts';
import type { NonFinalState } from '../StateMachine.ts';
import type {
	DPLL_ALL_CLAUSES_CHECKED_FUN,
	DPLL_ALL_CLAUSES_CHECKED_INPUT,
	DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	DPLL_CHECK_NON_DECISION_MADE_FUN,
	DPLL_CHECK_NON_DECISION_MADE_INPUT,
	DPLL_CHECK_PENDING_CLAUSES_FUN,
	DPLL_CHECK_PENDING_CLAUSES_INPUT,
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT,
	DPLL_EMPTY_CLAUSE_FUN,
	DPLL_EMPTY_CLAUSE_INPUT,
	DPLL_NEXT_CLAUSE_FUN,
	DPLL_NEXT_CLAUSE_INPUT,
	DPLL_PEEK_CLAUSE_SET_FUN,
	DPLL_PEEK_CLAUSE_SET_INPUT,
	DPLL_QUEUE_CLAUSE_SET_FUN,
	DPLL_QUEUE_CLAUSE_SET_INPUT,
	DPLL_UNIT_CLAUSE_DETECTION_FUN,
	DPLL_UNIT_CLAUSE_DETECTION_INPUT,
	DPLL_UNIT_CLAUSES_DETECTION_FUN,
	DPLL_UNIT_CLAUSES_DETECTION_INPUT
} from './dpll-domain.ts';
import type { DPLL_StateMachine } from './dpll-machine.ts';
import type { DPLL_SolverStateMachine } from './dpll-solver.ts';

export const initialTransition = (solver: DPLL_SolverStateMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	ecTransition(stateMachine);
	if (stateMachine.completed()) return;
	const clausesToQueue: Set<number> = ucdTransition(stateMachine);
	if (clausesToQueue.size === 0) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	queueClauseSetTransition(stateMachine, solver, clausesToQueue);
	const pendingClausesSet: boolean = checkPendingClausesSetTransition(stateMachine, solver);
	if (!pendingClausesSet) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	const clausesToCheck = peekClauseSetTransition(stateMachine, solver);
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clausesToCheck);
	if (allClausesChecked) {
		logFatal('This is not a possibility in this case');
	}
};

const ecTransition = (stateMachine: DPLL_StateMachine): void => {
	if (stateMachine.active !== 0) {
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
	}
	const result: boolean = ecState.run();
	if (result) stateMachine.transition('unsat_state');
	else stateMachine.transition('unit_clauses_detection_state');
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
	if (result.size === 0) stateMachine.transition('all_variables_assigned_state');
	else stateMachine.transition('queue_clause_set_state');
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

const queueClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverStateMachine,
	clauseSet: Set<number>
): void => {
	const queueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_QUEUE_CLAUSE_SET_FUN,
		DPLL_QUEUE_CLAUSE_SET_INPUT
	>;
	if (queueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause Set state');
	}
	queueClauseSetState.run(clauseSet, solver);
	stateMachine.transition('check_pending_clauses_state');
};

const checkPendingClausesSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverStateMachine
): boolean => {
	const checkPendingClausesSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CHECK_PENDING_CLAUSES_FUN,
		DPLL_CHECK_PENDING_CLAUSES_INPUT
	>;
	if (checkPendingClausesSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pending Clauses Set state');
	}
	const result: boolean = checkPendingClausesSetState.run(solver);
	if (result) stateMachine.transition('all_clauses_checked_state');
	else stateMachine.transition('all_variables_assigned_state');
	return result;
};

const peekClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverStateMachine
): Set<number> => {
	const peekClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_PEEK_CLAUSE_SET_FUN,
		DPLL_PEEK_CLAUSE_SET_INPUT
	>;
	if (peekClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	const result: Set<number> = peekClauseSetState.run(solver);
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
		logFatal('Function call error', 'There should be a function in the All Clausees Checked state');
	}
	const result: boolean = allClausesCheckedState.run(clauses);
	if (result) stateMachine.transition('unstack_clause_set_state');
	else stateMachine.transition('next_clause_state');
	return result;
};

export const analizeClause = (solver: DPLL_SolverStateMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	const clauseSet: Set<number> = solver.consultPostponed();
	const clauseId: number = nextClauseTransition(stateMachine, clauseSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine,clauseId);
	if(conflict) {
		decisionLevelTransition(stateMachine);
		return;
	}
	const unitClause:boolean = unitClauseDetectionTransition(stateMachine,clauseId);
	if(!unitClause) {
		//TODO
	}
}

const nextClauseTransition = (stateMachine: DPLL_StateMachine, clauseSet: Set<number>): number => {
	const nextCluaseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_NEXT_CLAUSE_FUN,
		DPLL_NEXT_CLAUSE_INPUT
	>;
	if (nextCluaseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseId: number = nextCluaseState.run(clauseSet);
	stateMachine.transition('conflict_detection_state');
	return clauseId;
}

const conflictDetectionTransition = (stateMachine: DPLL_StateMachine, clauseId: number): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<DPLL_CONFLICT_DETECTION_FUN, DPLL_CONFLICT_DETECTION_INPUT>
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseId);
	if(result) stateMachine.transition('decision_level_state');
	else stateMachine.transition('unit_clauses_detection_state');
	return result;
}

const decisionLevelTransition = (stateMachine: DPLL_StateMachine): void => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<DPLL_CHECK_NON_DECISION_MADE_FUN, DPLL_CHECK_NON_DECISION_MADE_INPUT>
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const result: boolean = decisionLevelState.run();
	if(result) stateMachine.transition('unsat_state');
	else stateMachine.transition('backtracking_state');
}

const unitClauseDetectionTransition = (stateMachine: DPLL_StateMachine, clauseId: number): boolean => {
	const unitClauseDetectionState = stateMachine.getActiveState() as NonFinalState<DPLL_UNIT_CLAUSE_DETECTION_FUN, DPLL_UNIT_CLAUSE_DETECTION_INPUT>
	if (unitClauseDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Clause Detection state');
	}
	const result: boolean = unitClauseDetectionState.run(clauseId);
	if(result) stateMachine.transition('unit_propagation_state');
	else stateMachine.transition('delete_clause_state');
	return result;
}