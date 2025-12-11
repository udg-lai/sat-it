import { isUnSATClause, type ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import {
	allAssigned as solverAllAssigned,
	backtracking as solverBacktracking,
	clauseEvaluation as solverClauseEvaluation,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	emptyClauseDetection as solverEmptyClauseDetection,
	nonDecisionMade as solverNonDecisionMade
} from '$lib/solvers/shared.svelte.ts';
import {
	getClausePool,
	getOccurrencesTableMapping,
	getVariablePool
} from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type { BKT_SolverMachine } from './bkt-solver-machine.svelte.ts';

// **state inputs **

export type BKT_EMPTY_CLAUSE_INPUT = 'all_variables_assigned_state' | 'unsat_state';
export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';
export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';
export type BKT_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';
export type BKT_QUEUE_OCCURRENCE_LIST_INPUT = 'pick_pending_occurrence_list_state';
export type BKT_PENDING_OCCURRENCE_LIST_INPUT = 'all_clauses_checked_state';
export type BKT_ALL_CLAUSES_CHECKED_INPUT =
	| 'next_occurrence_state'
	| 'all_variables_assigned_state';
export type BKT_NEXT_CLAUSE_INPUT = 'conflict_detection_state';
export type BKT_CONFLICT_DETECTION_INPUT =
	| 'delete_clause_state'
	| 'empty_pending_occurrence_list_state';
export type BKT_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';
export type BKT_EMPTY_PENDING_OCCURRENCE_LIST_INPUT = 'decision_level_state';
export type BKT_DECISION_LEVEL_INPUT = 'backtracking_state' | 'unsat_state';
export type BKT_BACKTRACKING_INPUT = 'complementary_occurrences_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSE_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT
	| BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	| BKT_QUEUE_OCCURRENCE_LIST_INPUT
	| BKT_PENDING_OCCURRENCE_LIST_INPUT
	| BKT_ALL_CLAUSES_CHECKED_INPUT
	| BKT_NEXT_CLAUSE_INPUT
	| BKT_CONFLICT_DETECTION_INPUT
	| BKT_DELETE_CLAUSE_INPUT
	| BKT_EMPTY_PENDING_OCCURRENCE_LIST_INPUT
	| BKT_DECISION_LEVEL_INPUT;

// ** state functions **

export type BKT_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: BKT_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverEmptyClauseDetection(pool);
};

export type BKT_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: BKT_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type BKT_DECIDE_FUN = () => number;

export const decide: BKT_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	return solverDecide(pool, 'backtracking');
};

export type BKT_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: BKT_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => {
	const mapping: Map<Lit, Set<CRef>> = getOccurrencesTableMapping();
	return solverComplementaryOccurrences(mapping, assignment);
};

export type BKT_QUEUE_OCCURRENCE_LIST_FUN = (
	complementary: Lit,
	clauses: Set<CRef>,
	solverStateMachine: BKT_SolverMachine
) => void;

export const queueOccurrenceList: BKT_QUEUE_OCCURRENCE_LIST_FUN = (
	complementary: Lit,
	clauses: Set<CRef>,
	solverStateMachine: BKT_SolverMachine
) => {
	solverStateMachine.setOccurrenceList({
		literal: complementary,
		occ: clauses
	});
};

export type BKT_PICK_PENDING_CLAUSE_SET_FUN = (solverStateMachine: BKT_SolverMachine) => Set<CRef>;

export const pickPendingOccurrenceList: BKT_PICK_PENDING_CLAUSE_SET_FUN = (
	solverStateMachine: BKT_SolverMachine
) => {
	const { occ: clauses, literal }: Occurrences = solverStateMachine.consultOccurrenceList();
	updateOccurrenceList(clauses, literal);
	return clauses;
};

export type BKT_ALL_CLAUSES_CHECKED_FUN = (pendingSet: Set<CRef>) => boolean;

export const allClausesChecked: BKT_ALL_CLAUSES_CHECKED_FUN = (pendingSet: Set<CRef>) => {
	return pendingSet.size === 0;
};

export type BKT_NEXT_CLAUSE_FUN = (pendingSet: Set<CRef>) => CRef;

export const nextClause: BKT_NEXT_CLAUSE_FUN = (pendingSet: Set<CRef>) => {
	const next: CRef | undefined = pendingSet.values().next().value;
	if (next === undefined) {
		logFatal('No more clauses', 'Trying to get next clause when there is none left');
	}
	return next as CRef;
};

export type BKT_CONFLICT_DETECTION_FUN = (cRef: CRef) => boolean;

export const unsatisfiedClause: BKT_CONFLICT_DETECTION_FUN = (cRef: CRef) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = solverClauseEvaluation(pool, cRef);
	return isUnSATClause(evaluation);
};

export type BKT_DELETE_CLAUSE_FUN = (pending: Set<CRef>, cRef: CRef) => void;

export const deleteClause: BKT_DELETE_CLAUSE_FUN = (pending: Set<CRef>, cRef: CRef) => {
	if (!pending.has(cRef)) {
		logFatal('Clause not found', `Clause - ${cRef} not found`);
	}
	pending.delete(cRef);
};

export type BKT_EMPTY_PENDING_OCCURRENCE_LIST_FUN = (solverStateMachine: BKT_SolverMachine) => void;

export const emptyClauseSet: BKT_EMPTY_PENDING_OCCURRENCE_LIST_FUN = (
	solverStateMachine: BKT_SolverMachine
) => {
	solverStateMachine.resolveOccurrences();
	cleanClausesToCheck();
};

export type BKT_DECISION_LEVEL_FUN = () => boolean;

export const nonDecisionMade: BKT_DECISION_LEVEL_FUN = () => {
	return solverNonDecisionMade();
};

export type BKT_BACKTRACKING_FUN = () => number;

export const backtracking: BKT_BACKTRACKING_FUN = () => {
	const pool: VariablePool = getVariablePool();
	return solverBacktracking(pool);
};

export type BKT_FUN =
	| BKT_EMPTY_CLAUSE_FUN
	| BKT_ALL_VARIABLES_ASSIGNED_FUN
	| BKT_DECIDE_FUN
	| BKT_COMPLEMENTARY_OCCURRENCES_FUN
	| BKT_QUEUE_OCCURRENCE_LIST_FUN
	| BKT_PICK_PENDING_CLAUSE_SET_FUN
	| BKT_ALL_CLAUSES_CHECKED_FUN
	| BKT_NEXT_CLAUSE_FUN
	| BKT_CONFLICT_DETECTION_FUN
	| BKT_DELETE_CLAUSE_FUN
	| BKT_EMPTY_PENDING_OCCURRENCE_LIST_FUN
	| BKT_DECISION_LEVEL_FUN
	| BKT_BACKTRACKING_FUN;
