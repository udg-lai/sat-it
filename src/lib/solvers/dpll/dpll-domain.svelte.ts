import { isUnitEval, type ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { type VisitingOccurrenceList } from '$lib/entities/OccurrenceList.svelte.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import {
	atLevelZero,
	clauseEvaluation,
	getNextClause,
	isClauseFalsified,
	allAssigned as solverAllAssigned,
	backtracking as solverBacktracking,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	unaryEmptyClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation
} from '$lib/solvers/shared.svelte.ts';
import {
	getClausePool,
	getOccurrenceListQueue,
	getOccurrencesTableMapping,
	getVariablePool,
	wipeOccurrences
} from '$lib/states/problem.svelte.ts';
import { unwrapEither } from '$lib/types/either.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

// ** state inputs **

export type DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT = 'queue_occurrences_state';

export type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT =
	| 'all_variables_assigned_state'
	| 'traversed_occurrences_state';

export type DPLL_QUEUE_OCCURRENCE_LIST_INPUT =
	| 'are_remaining_occurrences_state'
	| 'traversed_occurrences_state';

export type DPLL_UNSTACK_CLAUSE_SET_INPUT = 'are_remaining_occurrences_state';

export type DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT =
	| 'next_clause_state'
	| 'dequeue_occurrence_list_state';

export type DPLL_NEXT_OCCURRENCE_INPUT = 'falsified_clause_state';

export type DPLL_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'wipe_occurrence_queue_state';

export type DPLL_UNIT_CLAUSE_INPUT = 'traversed_occurrences_state' | 'unit_propagation_state';

export type DPLL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type DPLL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_retrieve_state';

export type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrences_state';

export type DPLL_AT_LEVEL_ZERO_INPUT = 'backtracking_state' | 'unsat_state';

export type DPLL_BACKTRACKING_INPUT = 'complementary_occurrences_retrieve_state';

export type DPLL_DECIDE_INPUT = 'complementary_occurrences_retrieve_state';

export type DPLL_WIPE_OCCURRENCE_QUEUE_INPUT = 'at_level_zero_state';

export type DPLL_INPUT =
	| DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
	| DPLL_ALL_VARIABLES_ASSIGNED_INPUT
	| DPLL_QUEUE_OCCURRENCE_LIST_INPUT
	| DPLL_UNSTACK_CLAUSE_SET_INPUT
	| DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT
	| DPLL_NEXT_OCCURRENCE_INPUT
	| DPLL_CONFLICT_DETECTION_INPUT
	| DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	| DPLL_UNIT_CLAUSE_INPUT
	| DPLL_UNIT_PROPAGATION_INPUT
	| DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	| DPLL_AT_LEVEL_ZERO_INPUT
	| DPLL_BACKTRACKING_INPUT
	| DPLL_DECIDE_INPUT
	| DPLL_WIPE_OCCURRENCE_QUEUE_INPUT;

// ** state functions **

export type DPLL_DECIDE_FUN = () => Lit;

export const decide: DPLL_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	const decision: Lit = solverDecide(pool, 'dpll');
	return decision;
};

export type DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type DPLL_QUEUE_OCCURRENCE_LIST_FUN = (occurrences: VisitingOccurrenceList) => void;

export const queueOccurrenceList: DPLL_QUEUE_OCCURRENCE_LIST_FUN = (
	occurrences: VisitingOccurrenceList
) => {
	getOccurrenceListQueue().enqueue(occurrences);
};

export type DPLL_UNSTACK_OCCURRENCE_LIST_FUN = () => void;

export const unstackOccurrenceList: DPLL_UNSTACK_OCCURRENCE_LIST_FUN = () => {
	getOccurrenceListQueue().dequeue();
};

export type DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => Set<CRef>;

export const unitEmptyClauseDetection: DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverUnitClauseDetection(pool);
};

export type DPLL_TRAVERSED_OCCURRENCE_LIST_FUN = (
	visitingOccurrences: VisitingOccurrenceList
) => boolean;

export const traversedOccurrenceList: DPLL_TRAVERSED_OCCURRENCE_LIST_FUN = (
	visitingOccurrences: VisitingOccurrenceList
) => {
	return unwrapEither(visitingOccurrences).traversed();
};

export type DPLL_NEXT_OCCURRENCE_FUN = () => CRef;

export const nextClause: DPLL_NEXT_OCCURRENCE_FUN = () => {
	return getNextClause();
};

export type DPLL_CONFLICT_DETECTION_FUN = (cRef: CRef) => boolean;

export const unsatisfiedClause: DPLL_CONFLICT_DETECTION_FUN = (cRef: CRef) => {
	return isClauseFalsified(cRef);
};

export type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = () => boolean;

export const pendingOccurrenceList: DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = () => {
	return !getOccurrenceListQueue().isEmpty();
};

export type DPLL_UNIT_CLAUSE_FUN = (cRef: CRef) => boolean;

export const unitClause: DPLL_UNIT_CLAUSE_FUN = (cRef: CRef) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, cRef);
	return isUnitEval(evaluation);
};

export type DPLL_UNIT_PROPAGATION_FUN = (cRef: CRef) => Lit;

export const unitPropagation: DPLL_UNIT_PROPAGATION_FUN = (cRef: CRef) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, cRef, 'up');
};

export type DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => {
	const mapping: Map<Lit, Set<CRef>> = getOccurrencesTableMapping();
	return solverComplementaryOccurrences(mapping, assignment);
};

export type DPLL_AT_LEVEL_ZERO_FUN = () => boolean;

export const atLevelZeroFun: DPLL_AT_LEVEL_ZERO_FUN = () => {
	return atLevelZero();
};

export type DPLL_BACKTRACKING_FUN = () => Lit;

export const backtracking: DPLL_BACKTRACKING_FUN = () => {
	const bktAssignment: Lit = solverBacktracking(getVariablePool());
	return bktAssignment;
};

export type DPLL_WIPE_OCCURRENCE_QUEUE_FUN = () => void;

export const wipeOccurrenceQueue: DPLL_WIPE_OCCURRENCE_QUEUE_FUN = () => {
	// Drop all the occurrences lists inside the solver's queue
	wipeOccurrences();
};

export type DPLL_FUN =
	| DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN
	| DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN
	| DPLL_ALL_VARIABLES_ASSIGNED_FUN
	| DPLL_QUEUE_OCCURRENCE_LIST_FUN
	| DPLL_UNSTACK_OCCURRENCE_LIST_FUN
	| DPLL_NEXT_OCCURRENCE_FUN
	| DPLL_CONFLICT_DETECTION_FUN
	| DPLL_UNIT_CLAUSE_FUN
	| DPLL_UNIT_PROPAGATION_FUN
	| DPLL_COMPLEMENTARY_OCCURRENCES_FUN
	| DPLL_AT_LEVEL_ZERO_FUN
	| DPLL_BACKTRACKING_FUN
	| DPLL_DECIDE_FUN
	| DPLL_WIPE_OCCURRENCE_QUEUE_FUN;
