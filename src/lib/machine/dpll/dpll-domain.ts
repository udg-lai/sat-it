import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import { problemStore, type MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import {
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	emptyClauseDetection as solverEmptyClauseDetection,
	triggeredClauses as solverTriggeredClauses,
	unitClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation,
	complementaryOccurrences as solverComplementaryOccurrences,
	nonDecisionMade as solverNonDecisionMade,
	backtracking as solverBacktracking,
	decide as solverDecide
} from '$lib/transversal/algorithms/solver.ts';
import { isUnitClause, isUnSATClause, type ClauseEval } from '$lib/transversal/entities/Clause.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { get } from 'svelte/store';
import type { DPLL_SolverStateMachine } from './dpll-solver.ts';

// ** state inputs **

export type DPLL_EMPTY_CLAUSE_INPUT = 'unit_clauses_detection_state' | 'unsat_state';

export type DPLL_TRIGGERED_CLAUSES_INPUT =
	| 'queue_clause_set_state'
	| 'all_variables_assigned_state'
	| 'delete_clause_state';

export type DPLL_UNIT_CLAUSES_DETECTION_INPUT = 'triggered_clauses_state';

export type DPLL_PEEK_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type DPLL_CHECK_PENDING_CLAUSES_INPUT =
	| 'all_variables_assigned_state'
	| 'peek_clause_set_state';

export type DPLL_QUEUE_CLAUSE_SET_INPUT = 'check_pending_clauses_state' | 'delete_clause_state';

export type DPLL_UNSTACK_CLAUSE_SET_INPUT = 'check_state';

export type DPLL_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';

export type DPLL_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'unstack_clause_set_state';

export type DPLL_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type DPLL_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'decision_level_state';

export type DPLL_UNIT_CLAUSE_DETECTION_INPUT = 'delete_clause_state' | 'unit_propagation_state';

export type DPLL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type DPLL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT = 'triggered_clauses_state';

export type DPLL_CHECK_NON_DECISION_MADE_INPUT = 'backtracking_state' | 'unsat_state';

export type DPLL_BACKTRACKING_INPUT = 'complementary_occurrences_state';

export type DPLL_DECIDE_INPUT = 'complementary_occurrences_state';

export type DPLL_INPUT =
	| DPLL_EMPTY_CLAUSE_INPUT
	| DPLL_UNIT_CLAUSES_DETECTION_INPUT
	| DPLL_PEEK_CLAUSE_SET_INPUT
	| DPLL_ALL_VARIABLES_ASSIGNED_INPUT
	| DPLL_TRIGGERED_CLAUSES_INPUT
	| DPLL_QUEUE_CLAUSE_SET_INPUT
	| DPLL_UNSTACK_CLAUSE_SET_INPUT
	| DPLL_ALL_CLAUSES_CHECKED_INPUT
	| DPLL_NEXT_CLAUSE_INPUT
	| DPLL_CONFLICT_DETECTION_INPUT
	| DPLL_CHECK_PENDING_CLAUSES_INPUT
	| DPLL_DELETE_CLAUSE_INPUT
	| DPLL_UNIT_CLAUSE_DETECTION_INPUT
	| DPLL_UNIT_PROPAGATION_INPUT
	| DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	| DPLL_CHECK_NON_DECISION_MADE_INPUT
	| DPLL_BACKTRACKING_INPUT
	| DPLL_DECIDE_INPUT;

// ** state functions **

export type DPLL_DECIDE_FUN = (assignmentEvent: AssignmentEvent) => number;

export const decide: DPLL_DECIDE_FUN = (assignmentEvent: AssignmentEvent) => {
	const pool: VariablePool = get(problemStore).variables;
	return solverDecide(pool, assignmentEvent, 'dpll');
};

export type DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = get(problemStore).variables;
	return solverAllAssigned(pool);
};

export type DPLL_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: DPLL_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = get(problemStore).clauses;
	return solverEmptyClauseDetection(pool);
};

export type DPLL_QUEUE_CLAUSE_SET_FUN = (
	clauses: Set<number>,
	solverStateMachine: DPLL_SolverStateMachine
) => void;

export const queueClauseSet: DPLL_QUEUE_CLAUSE_SET_FUN = (
	clauses: Set<number>,
	solverStateMachine: DPLL_SolverStateMachine
) => {
	if (clauses.size === 0) {
		logFatal('Empty set of clauses are not thought to be queued');
	}
	return solverStateMachine.postpone(clauses);
};

export type DPLL_UNSTACK_CLAUSE_SET_FUN = (solverStateMachine: DPLL_SolverStateMachine) => void;

export const unstackClauseSet: DPLL_UNSTACK_CLAUSE_SET_FUN = (
	solverStateMachine: DPLL_SolverStateMachine
) => {
	return solverStateMachine.resolvePostponed();
};

export type DPLL_UNIT_CLAUSES_DETECTION_FUN = () => Set<number>;

export const unitClauseDetection: DPLL_UNIT_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = get(problemStore).clauses;
	return solverUnitClauseDetection(pool);
};

export type DPLL_TRIGGERED_CLAUSES_FUN = (clauses: Set<number>) => boolean;

export const triggeredClauses: DPLL_TRIGGERED_CLAUSES_FUN = (clauses: Set<number>) => {
	return solverTriggeredClauses(clauses);
};

export type DPLL_DELETE_CLAUSE_FUN = (clauses: Set<number>, clauseId: number) => void;

export const deleteClause: DPLL_DELETE_CLAUSE_FUN = (clauses: Set<number>, clauseId: number) => {
	if (!clauses.has(clauseId)) {
		logFatal('Clause not found', `Clause - ${clauseId} not found`);
	}
	clauses.delete(clauseId);
};

export type DPLL_PEEK_CLAUSE_SET_FUN = (solverStateMachine: DPLL_SolverStateMachine) => Set<number>;

export const peekPendingClauseSet: DPLL_PEEK_CLAUSE_SET_FUN = (
	solverStateMachine: DPLL_SolverStateMachine
) => {
	const clauseSet: Set<number> = solverStateMachine.consultPostponed();
	return clauseSet;
};

export type DPLL_ALL_CLAUSES_CHECKED_FUN = (clauses: Set<number>) => boolean;

export const allClausesChecked: DPLL_ALL_CLAUSES_CHECKED_FUN = (clauses: Set<number>) => {
	return clauses.size === 0;
};

export type DPLL_NEXT_CLAUSE_FUN = (clauses: Set<number>) => number;

export const nextClause: DPLL_NEXT_CLAUSE_FUN = (clauses: Set<number>) => {
	if (clauses.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = clauses.values().next();
	const clauseId = clausesIterator.value;
	return clauseId as number;
};

export type DPLL_CONFLICT_DETECTION_FUN = (clauseId: number) => boolean;

export const unsatisfiedClause: DPLL_CONFLICT_DETECTION_FUN = (clauseId: number) => {
	const pool: ClausePool = get(problemStore).clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseId);
	return isUnSATClause(evaluation);
};

export type DPLL_CHECK_PENDING_CLAUSES_FUN = (
	solverStateMachine: DPLL_SolverStateMachine
) => boolean;

export const thereAreJobPostponed: DPLL_CHECK_PENDING_CLAUSES_FUN = (
	solverStateMachine: DPLL_SolverStateMachine
) => {
	return solverStateMachine.thereArePostponed();
};

export type DPLL_UNIT_CLAUSE_DETECTION_FUN = (clauseId: number) => boolean;

export const unitClause: DPLL_UNIT_CLAUSE_DETECTION_FUN = (clauseId: number) => {
	const pool: ClausePool = get(problemStore).clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseId);
	return isUnitClause(evaluation);
};

export type DPLL_UNIT_PROPAGATION_FUN = (clauseId: number) => number;

export const unitPropagation: DPLL_UNIT_PROPAGATION_FUN = (clauseId: number) => {
	const variables: VariablePool = get(problemStore).variables;
	const clauses: ClausePool = get(problemStore).clauses;
	return solverUnitPropagation(variables, clauses, clauseId);
};

export type DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => Set<number>;

export const complementaryOccurrences: DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: MappingLiteral2Clauses = get(problemStore).mapping;
	return solverComplementaryOccurrences(mapping, literal);
};

export type DPLL_CHECK_NON_DECISION_MADE_FUN = () => boolean;

export const nonDecisionMade: DPLL_CHECK_NON_DECISION_MADE_FUN = () => {
	return solverNonDecisionMade();
};

export type DPLL_BACKTRACKING_FUN = () => number;

export const backtracking: DPLL_BACKTRACKING_FUN = () => {
	const pool: VariablePool = get(problemStore).variables;
	return solverBacktracking(pool);
};

export type DPLL_FUN =
	| DPLL_EMPTY_CLAUSE_FUN
	| DPLL_UNIT_CLAUSES_DETECTION_FUN
	| DPLL_PEEK_CLAUSE_SET_FUN
	| DPLL_CHECK_PENDING_CLAUSES_FUN
	| DPLL_ALL_VARIABLES_ASSIGNED_FUN
	| DPLL_QUEUE_CLAUSE_SET_FUN
	| DPLL_UNSTACK_CLAUSE_SET_FUN
	| DPLL_DELETE_CLAUSE_FUN
	| DPLL_CONFLICT_DETECTION_FUN
	| DPLL_UNIT_CLAUSE_DETECTION_FUN
	| DPLL_UNIT_PROPAGATION_FUN
	| DPLL_COMPLEMENTARY_OCCURRENCES_FUN
	| DPLL_CHECK_NON_DECISION_MADE_FUN
	| DPLL_BACKTRACKING_FUN
	| DPLL_DECIDE_FUN;
