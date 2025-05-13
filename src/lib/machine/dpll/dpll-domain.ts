import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import {
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	dequeueClauseSet as solverDequeueClauseSet,
	emptyClauseDetection as solverEmptyClauseDetection,
	queueClauseSet as solverQueueClauseSet,
	triggeredClauses as solverTriggeredClauses,
	unitClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation,
	complementaryOccurrences as solverComplementaryOccurrences,
	decisionLevel as solverDecisionLevel,
	backtracking as solverBacktracking,
	decide as solverDecide
} from '$lib/transversal/algorithms/solver.ts';
import { isUnitClause, isUnSATClause } from '$lib/transversal/entities/Clause.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { type AssignmentEval } from '$lib/transversal/interfaces/IClausePool.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { SolverStateMachine } from '../SolverStateMachine.ts';

// ** state inputs **

export type DPLL_EMPTY_CLAUSE_INPUT = 'ucd_state' | 'unsat_state';

export type DPLL_TRIGGERED_CLAUSES_INPUT =
	| 'queue_clause_set_state'
	| 'all_variables_assigned_state'
	| 'delete_clause_state';

export type DPLL_UNIT_CLAUSES_DETECTION_INPUT = 'triggered_clauses_state';

export type DPLL_CLAUSES_INPUT = 'all_variables_assigned_state' | 'peek_pending_clause_set_state';

export type DPLL_PEEK_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type DPLL_CHECK_PENDING_CLAUSES_INPUT =
	| 'all_variables_assigned_state'
	| 'peek_pending_clause_set_state';

export type DPLL_QUEUE_CLAUSE_SET_INPUT = 'check_pending_clauses_state' | 'delete_clause_state';

export type DPLL_UNSTACK_CLAUSE_SET_INPUT = 'check_state';

export type DPLL_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';

export type DPLL_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state';

export type DPLL_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type DPLL_CONFLICT_DETECTION_INPUT = 'unit_clause_state';

export type DPLL_UNIT_CLAUSE_DETECTION_INPUT = 'delete_clause_state' | 'unit_propagation_state';

export type DPLL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type DPLL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT = 'triggered_clauses_state';

export type DPLL_DECISION_LEVEL_INPUT = 'backtracking_state';

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
	| DPLL_DECISION_LEVEL_INPUT
	| DPLL_BACKTRACKING_INPUT
	| DPLL_DECIDE_INPUT;

// ** state functions **

export type DPLL_DECIDE_FUN = (pool: VariablePool, assignmentEvent: AssignmentEvent) => number;

export const decide: DPLL_DECIDE_FUN = (pool: VariablePool, assignmentEvent: AssignmentEvent) => {
	return solverDecide(pool, assignmentEvent, 'dpll');
};

export type DPLL_ALL_VARIABLES_ASSIGNED_FUN = (pool: VariablePool) => boolean;

export const allAssigned: DPLL_ALL_VARIABLES_ASSIGNED_FUN = (pool: VariablePool) => {
	return solverAllAssigned(pool);
};

export type DPLL_EMPTY_CLAUSE_FUN = (pool: ClausePool) => AssignmentEval;

export const emptyClauseDetection: DPLL_EMPTY_CLAUSE_FUN = (pool: ClausePool) => {
	return solverEmptyClauseDetection(pool);
};

export type DPLL_QUEUE_CLAUSE_SET_FUN = (
	clauses: Set<number>,
	solverStateMachine: SolverStateMachine
) => void;

export const queueClauseSet: DPLL_QUEUE_CLAUSE_SET_FUN = (
	clauses: Set<number>,
	solverStateMachine: SolverStateMachine
) => {
	return solverQueueClauseSet(clauses, solverStateMachine);
};

export type DPLL_UNSTACK_CLAUSE_SET_FUN = (solverStateMachine: SolverStateMachine) => void;

export const unstackClauseSet: DPLL_UNSTACK_CLAUSE_SET_FUN = (
	solverStateMachine: SolverStateMachine
) => {
	return solverDequeueClauseSet(solverStateMachine);
};

export type DPLL_UNIT_CLAUSES_DETECTION_FUN = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UNIT_CLAUSES_DETECTION_FUN = (pool: ClausePool) => {
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

export type DPLL_PEEK_CLAUSE_SET_FUN = (solverStateMachine: SolverStateMachine) => Set<number>;

export const peekPendingClauseSet: DPLL_PEEK_CLAUSE_SET_FUN = (
	solverStateMachine: SolverStateMachine
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

export type DPLL_CONFLICT_DETECTION_FUN = (pool: ClausePool, clauseId: number) => boolean;

export const unsatisfiedClause: DPLL_CONFLICT_DETECTION_FUN = (
	pool: ClausePool,
	clauseId: number
) => {
	const evaluation = clauseEvaluation(pool, clauseId);
	return isUnSATClause(evaluation);
};

export type DPLL_CHECK_PENDING_CLAUSES_FUN = (solverStateMachine: SolverStateMachine) => boolean;

export const thereAreJobPostponed: DPLL_CHECK_PENDING_CLAUSES_FUN = (
	solverStateMachine: SolverStateMachine
) => {
	return solverStateMachine.thereArePostponed();
};

export type DPLL_UNIT_CLAUSE_DETECTION_FUN = (pool: ClausePool, clauseId: number) => boolean;

export const unitClause: DPLL_UNIT_CLAUSE_DETECTION_FUN = (pool: ClausePool, clauseId: number) => {
	const evaluation = clauseEvaluation(pool, clauseId);
	return isUnitClause(evaluation);
};

export type DPLL_UNIT_PROPAGATION_FUN = (
	variables: VariablePool,
	clauses: ClausePool,
	clauseId: number,
	trail: Trail
) => number;

export const unitPropagation: DPLL_UNIT_PROPAGATION_FUN = (
	variables: VariablePool,
	clauses: ClausePool,
	clauseId: number
) => {
	return solverUnitPropagation(variables, clauses, clauseId);
};

export type DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (
	mapping: MappingLiteral2Clauses,
	literal: number
) => Set<number>;

export const complementaryOccurrences: DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (
	mapping: MappingLiteral2Clauses,
	literal: number
) => {
	return solverComplementaryOccurrences(mapping, literal);
};

export type DPLL_DECISION_LEVEL_FUN = () => boolean;

export const decisionLevel: DPLL_DECISION_LEVEL_FUN = () => {
	return solverDecisionLevel();
};

export type DPLL_BACKTRACKING_FUN = (pool: VariablePool) => number;

export const backtracking: DPLL_BACKTRACKING_FUN = (pool: VariablePool) => {
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
	| DPLL_DECISION_LEVEL_FUN
	| DPLL_BACKTRACKING_FUN
	| DPLL_DECIDE_FUN;
