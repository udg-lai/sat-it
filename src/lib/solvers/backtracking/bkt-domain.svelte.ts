import { isUnsatisfiedEval, type ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import {
	atLevelZero,
	allAssigned as solverAllAssigned,
	backtracking as solverBacktracking,
	clauseEvaluation as solverClauseEvaluation,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	emptyClauseDetection as solverEmptyClauseDetection
} from '$lib/solvers/shared.svelte.ts';
import { getOccurrenceList, updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import {
	getClausePool,
	getOccurrencesTableMapping,
	getVariablePool
} from '$lib/states/problem.svelte.ts';
import { getOccurrenceListQueue, wipeOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

// **state inputs **

export type BKT_EMPTY_CLAUSE_INPUT = 'all_variables_assigned_state' | 'at_level_zero_state';
export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';
export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';
export type BKT_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';
export type BKT_QUEUE_OCCURRENCE_LIST_INPUT = 'pick_occurrence_list_state';
export type BKT_PICK_OCCURRENCE_LIST_INPUT = 'traversed_occurrences_state';
export type BKT_TRAVERSED_OCCURRENCE_LIST_INPUT = 'next_clause_state' | 'dequeue_occurrence_list_state';
export type BKT_NEXT_OCCURRENCE_INPUT = 'falsified_clause_state';
export type BKT_CONFLICT_DETECTION_INPUT =
	| 'traversed_occurrences_state'
	| 'wipe_occurrence_queue_state';
export type BKT_WIPE_OCCURRENCE_QUEUE_INPUT = 'at_level_zero_state';
export type BKT_AT_LEVEL_ZERO_INPUT = 'backtracking_state' | 'unsat_state';
export type BKT_BACKTRACKING_INPUT = 'complementary_occurrences_state';
export type BKT_DEQUEUE_OCCURRENCE_LIST_INPUT = 'all_variables_assigned_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSE_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT
	| BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	| BKT_QUEUE_OCCURRENCE_LIST_INPUT
	| BKT_PICK_OCCURRENCE_LIST_INPUT
	| BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
	| BKT_NEXT_OCCURRENCE_INPUT
	| BKT_CONFLICT_DETECTION_INPUT
	| BKT_WIPE_OCCURRENCE_QUEUE_INPUT
	| BKT_AT_LEVEL_ZERO_INPUT
	| BKT_DEQUEUE_OCCURRENCE_LIST_INPUT;

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
	getOccurrenceListQueue().enqueue(occurrenceList);
};

export type BKT_PICK_OCCURRENCE_LIST_FUN = () => OccurrenceList;

export const pickPendingOccurrenceList: BKT_PICK_OCCURRENCE_LIST_FUN = () => {
	const occurrenceList: OccurrenceList = getOccurrenceListQueue().element()
	updateOccurrenceList(occurrenceList)
	return occurrenceList;
};

export type BKT_DEQUEUE_OCCURRENCE_LIST_FUN = () => void;

export const dequeueOccurrenceList: BKT_DEQUEUE_OCCURRENCE_LIST_FUN = () => {
	getOccurrenceListQueue().dequeue();
	updateOccurrenceList(new OccurrenceList());
};

export type BKT_TRAVERSED_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => boolean;

export const traversedOccurrenceList: BKT_TRAVERSED_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => {
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

export type BKT_WIPE_OCCURRENCE_QUEUE_FUN = () => void;

export const wipeOccurrenceQueue: BKT_WIPE_OCCURRENCE_QUEUE_FUN = () => {
	// Drop all the occurrence lists inside the solver (There will only be one)
	wipeOccurrenceListQueue()
	// Updates the view with an empty occurrence list
	updateOccurrenceList(new OccurrenceList())

};

export type BKT_AT_LEVEL_ZERO_FUN = () => boolean;

export const nonDecisionMade: BKT_AT_LEVEL_ZERO_FUN = () => {
	return atLevelZero();
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
	| BKT_PICK_OCCURRENCE_LIST_FUN
	| BKT_TRAVERSED_OCCURRENCE_LIST_FUN
	| BKT_NEXT_OCCURRENCE_FUN
	| BKT_CONFLICT_DETECTION_FUN
	| BKT_WIPE_OCCURRENCE_QUEUE_FUN
	| BKT_AT_LEVEL_ZERO_FUN
	| BKT_BACKTRACKING_FUN
	| BKT_DEQUEUE_OCCURRENCE_LIST_FUN;
