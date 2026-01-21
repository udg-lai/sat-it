import Clause, { isUnsatisfiedEval, type ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import {
	atLevelZero,
	allAssigned as solverAllAssigned,
	backtracking as solverBacktracking,
	clauseEvaluation as solverClauseEvaluation,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide
} from '$lib/solvers/shared.svelte.ts';
import {
	getClausePool,
	getOccurrenceList,
	getOccurrencesTableMapping,
	getProblemStore,
	getVariablePool
} from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

// **state inputs **

export type BKT_EMPTY_CLAUSES_DETECTION_INPUT = 'queue_occurrence_list_state';
export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';
export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';
export type BKT_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';
export type BKT_QUEUE_OCCURRENCE_LIST_INPUT = 'traversed_occurrences_state';
export type BKT_TRAVERSED_OCCURRENCE_LIST_INPUT =
	| 'next_clause_state'
	| 'dequeue_occurrence_list_state';
export type BKT_NEXT_OCCURRENCE_INPUT = 'falsified_clause_state';
export type BKT_CONFLICT_DETECTION_INPUT =
	| 'traversed_occurrences_state'
	| 'dequeue_occurrence_list_state';
export type BKT_AT_LEVEL_ZERO_INPUT = 'backtracking_state' | 'unsat_state';
export type BKT_BACKTRACKING_INPUT = 'complementary_occurrences_state';
export type BKT_DEQUEUE_OCCURRENCE_LIST_INPUT =
	| 'all_variables_assigned_state'
	| 'at_level_zero_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSES_DETECTION_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT
	| BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	| BKT_QUEUE_OCCURRENCE_LIST_INPUT
	| BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
	| BKT_NEXT_OCCURRENCE_INPUT
	| BKT_CONFLICT_DETECTION_INPUT
	| BKT_AT_LEVEL_ZERO_INPUT
	| BKT_DEQUEUE_OCCURRENCE_LIST_INPUT;

// ** state functions **

export type BKT_EMPTY_CLAUSES_DETECTION_FUN = () => Set<CRef>;

export const emptyClausesDetection: BKT_EMPTY_CLAUSES_DETECTION_FUN = () => {
	const clausePool: ClausePool = getClausePool();
	const emptyClauses: Clause[] = clausePool.getClauses((c: Clause) => c.isEmpty());
	return new Set(emptyClauses.map((c: Clause) => c.getCRef()));
};

export type BKT_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: BKT_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type BKT_DECIDE_FUN = () => number;

export const decide: BKT_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	const decision: Lit = solverDecide(pool, 'backtracking');
	return decision;
};

export type BKT_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: BKT_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => {
	const mapping: Map<Lit, Set<CRef>> = getOccurrencesTableMapping();
	return solverComplementaryOccurrences(mapping, assignment);
};

export type BKT_QUEUE_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => void;

export const queueOccurrenceList: BKT_QUEUE_OCCURRENCE_LIST_FUN = (
	occurrenceList: OccurrenceList
) => {
	getProblemStore().updateInspectingOccurrences(occurrenceList);
};

export type BKT_DEQUEUE_OCCURRENCE_LIST_FUN = () => void;

export const dequeueOccurrenceList: BKT_DEQUEUE_OCCURRENCE_LIST_FUN = () => {
	getProblemStore().updateInspectingOccurrences(new OccurrenceList());
};

export type BKT_TRAVERSED_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => boolean;

export const traversedOccurrenceList: BKT_TRAVERSED_OCCURRENCE_LIST_FUN = (
	occurrenceList: OccurrenceList
) => {
	return occurrenceList.traversed();
};

export type BKT_NEXT_OCCURRENCE_FUN = () => CRef;

export const nextClause: BKT_NEXT_OCCURRENCE_FUN = () => {
	const occurrenceList: OccurrenceList = getOccurrenceList();
	if (occurrenceList.isEmpty()) {
		logFatal('A non empty set was expected');
	}
	return occurrenceList.next();
};

export type BKT_CONFLICT_DETECTION_FUN = (cRef: CRef) => boolean;

export const unsatisfiedClause: BKT_CONFLICT_DETECTION_FUN = (cRef: CRef) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = solverClauseEvaluation(pool, cRef);
	return isUnsatisfiedEval(evaluation);
};

export type BKT_AT_LEVEL_ZERO_FUN = () => boolean;

export const nonDecisionMade: BKT_AT_LEVEL_ZERO_FUN = () => {
	return atLevelZero();
};

export type BKT_BACKTRACKING_FUN = () => Lit;

export const backtracking: BKT_BACKTRACKING_FUN = () => {
	const pool: VariablePool = getVariablePool();
	return solverBacktracking(pool);
};

export type BKT_FUN =
	| BKT_EMPTY_CLAUSES_DETECTION_FUN
	| BKT_ALL_VARIABLES_ASSIGNED_FUN
	| BKT_DECIDE_FUN
	| BKT_COMPLEMENTARY_OCCURRENCES_FUN
	| BKT_QUEUE_OCCURRENCE_LIST_FUN
	| BKT_TRAVERSED_OCCURRENCE_LIST_FUN
	| BKT_NEXT_OCCURRENCE_FUN
	| BKT_CONFLICT_DETECTION_FUN
	| BKT_AT_LEVEL_ZERO_FUN
	| BKT_BACKTRACKING_FUN
	| BKT_DEQUEUE_OCCURRENCE_LIST_FUN;
