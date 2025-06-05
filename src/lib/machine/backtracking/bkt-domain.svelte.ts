import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { getProblemStore, type MappingLiteral2Clauses } from '$lib/store/problem.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import {
	allAssigned as solverAllAssigned,
	backtracking as solverBacktracking,
	clauseEvaluation as solverClauseEvaluation,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	emptyClauseDetection as solverEmptyClauseDetection,
	nonDecisionMade as solverNonDecisionMade,
	triggeredClauses as solverTriggeredClauses
} from '$lib/transversal/algorithms/solver.svelte.ts';
import { isUnSATClause, type ClauseEval } from '$lib/transversal/entities/Clause.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { BKT_SolverMachine } from './bkt-solver-machine.svelte.ts';
import type { PendingItem } from '../SolverMachine.svelte.ts';

// **state inputs **

export type BKT_EMPTY_CLAUSE_INPUT = 'all_variables_assigned_state' | 'unsat_state';
export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';
export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';
export type BKT_COMPLEMENTARY_OCCURRENCES_INPUT = 'triggered_clauses_state';
export type BKT_TRIGGERED_CLAUSES_INPUT = 'queue_clause_set_state' | 'all_variables_assigned_state';
export type BKT_QUEUE_CLAUSE_SET_INPUT = 'pick_pending_set_state';
export type BKT_PICK_PENDING_SET_INPUT = 'all_clauses_checked_state';
export type BKT_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'all_variables_assigned_state';
export type BKT_NEXT_CLAUSE_INPUT = 'conflict_detection_state';
export type BKT_CONFLICT_DETECTION_INPUT = 'delete_clause_state' | 'empty_pending_set_state';
export type BKT_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';
export type BKT_EMPTY_PENDING_SET_INPUT = 'decision_level_state';
export type BKT_DECISION_LEVEL_INPUT = 'backtracking_state' | 'unsat_state';
export type BKT_BACKTRACKING_INPUT = 'complementary_occurrences_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSE_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT
	| BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	| BKT_TRIGGERED_CLAUSES_INPUT
	| BKT_QUEUE_CLAUSE_SET_INPUT
	| BKT_PICK_PENDING_SET_INPUT
	| BKT_ALL_CLAUSES_CHECKED_INPUT
	| BKT_NEXT_CLAUSE_INPUT
	| BKT_CONFLICT_DETECTION_INPUT
	| BKT_DELETE_CLAUSE_INPUT
	| BKT_EMPTY_PENDING_SET_INPUT
	| BKT_DECISION_LEVEL_INPUT;

// ** state functions **

export type BKT_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: BKT_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = getProblemStore().clauses;
	return solverEmptyClauseDetection(pool);
};

export type BKT_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: BKT_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getProblemStore().variables;
	return solverAllAssigned(pool);
};

export type BKT_DECIDE_FUN = () => number;

export const decide: BKT_DECIDE_FUN = () => {
	const pool: VariablePool = getProblemStore().variables;
	return solverDecide(pool, 'backtracking');
};

export type BKT_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => SvelteSet<number>;

export const complementaryOccurrences: BKT_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: MappingLiteral2Clauses = getProblemStore().mapping;
	return solverComplementaryOccurrences(mapping, literal);
};

export type BKT_TRIGGERED_CLAUSES_FUN = (clauses: SvelteSet<number>) => boolean;

export const triggeredClauses: BKT_TRIGGERED_CLAUSES_FUN = (clauses: SvelteSet<number>) => {
	return solverTriggeredClauses(clauses);
};

export type BKT_QUEUE_CLAUSE_SET_FUN = (
	variable: number,
	clauses: SvelteSet<number>,
	solverStateMachine: BKT_SolverMachine
) => void;

export const queueClauseSet: BKT_QUEUE_CLAUSE_SET_FUN = (
	variable: number,
	clauses: SvelteSet<number>,
	solverStateMachine: BKT_SolverMachine
) => {
	if (clauses.size === 0) {
		logFatal('Empty set of clauses are not thought to be queued');
	}
	solverStateMachine.enqueue({clauseSet: clauses, variable});
};

export type BKT_PICK_PENDING_SET_FUN = (solverStateMachine: BKT_SolverMachine) => SvelteSet<number>;

export const pickPendingSet: BKT_PICK_PENDING_SET_FUN = (solverStateMachine: BKT_SolverMachine) => {
	const pendingItem: PendingItem = solverStateMachine.consultPending();
	updateClausesToCheck(pendingItem.clauseSet, pendingItem.variable );
	return pendingItem.clauseSet;
};

export type BKT_ALL_CLAUSES_CHECKED_FUN = (pendingSet: SvelteSet<number>) => boolean;

export const allClausesChecked: BKT_ALL_CLAUSES_CHECKED_FUN = (pendingSet: SvelteSet<number>) => {
	return pendingSet.size === 0;
};

export type BKT_NEXT_CLAUSE_FUN = (pendingSet: SvelteSet<number>) => number;

export const nextClause: BKT_NEXT_CLAUSE_FUN = (pendingSet: SvelteSet<number>) => {
	if (pendingSet.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = pendingSet.values().next();
	const clauseId = clausesIterator.value;
	return clauseId as number;
};

export type BKT_CONFLICT_DETECTION_FUN = (clauseId: number) => boolean;

export const unsatisfiedClause: BKT_CONFLICT_DETECTION_FUN = (clauseId: number) => {
	const pool: ClausePool = getProblemStore().clauses;
	const evaluation: ClauseEval = solverClauseEvaluation(pool, clauseId);
	return isUnSATClause(evaluation);
};

export type BKT_DELETE_CLAUSE_FUN = (pending: SvelteSet<number>, clauseId: number) => void;

export const deleteClause: BKT_DELETE_CLAUSE_FUN = (
	pending: SvelteSet<number>,
	clauseId: number
) => {
	if (!pending.has(clauseId)) {
		logFatal('Clause not found', `Clause - ${clauseId} not found`);
	}
	pending.delete(clauseId);
};

export type BKT_EMPTY_PENDING_SET_FUN = (solverStateMachine: BKT_SolverMachine) => void;

export const emptyClauseSet: BKT_EMPTY_PENDING_SET_FUN = (
	solverStateMachine: BKT_SolverMachine
) => {
	solverStateMachine.clear();
	//I DON'T KNOW IF I REALLY NEED THIS CODELINE
	updateClausesToCheck(new SvelteSet<number>(), -1);
};

export type BKT_DECISION_LEVEL_FUN = () => boolean;

export const nonDecisionMade: BKT_DECISION_LEVEL_FUN = () => {
	return solverNonDecisionMade();
};

export type BKT_BACKTRACKING_FUN = () => number;

export const backtracking: BKT_BACKTRACKING_FUN = () => {
	const pool: VariablePool = getProblemStore().variables;
	return solverBacktracking(pool);
};

export type BKT_FUN =
	| BKT_EMPTY_CLAUSE_FUN
	| BKT_ALL_VARIABLES_ASSIGNED_FUN
	| BKT_DECIDE_FUN
	| BKT_COMPLEMENTARY_OCCURRENCES_FUN
	| BKT_TRIGGERED_CLAUSES_FUN
	| BKT_QUEUE_CLAUSE_SET_FUN
	| BKT_PICK_PENDING_SET_FUN
	| BKT_ALL_CLAUSES_CHECKED_FUN
	| BKT_NEXT_CLAUSE_FUN
	| BKT_CONFLICT_DETECTION_FUN
	| BKT_DELETE_CLAUSE_FUN
	| BKT_EMPTY_PENDING_SET_FUN
	| BKT_DECISION_LEVEL_FUN
	| BKT_BACKTRACKING_FUN;
