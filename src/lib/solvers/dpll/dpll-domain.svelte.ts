import { getClausePool, getMapping, getVariablePool } from '$lib/states/problem.svelte.ts';
import type { OccurrencesList } from '$lib/entities/Problem.svelte.ts';
import {
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	emptyClauseDetection as solverEmptyClauseDetection,
	unitClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation,
	complementaryOccurrences as solverComplementaryOccurrences,
	nonDecisionMade as solverNonDecisionMade,
	backtracking as solverBacktracking,
	decide as solverDecide
} from '$lib/solvers/shared.svelte.ts';
import type { DPLL_SolverMachine } from './dpll-solver-machine.svelte.ts';
import {
	cleanClausesToCheck,
	updateClausesToCheck
} from '$lib/states/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import type { OccurrenceList } from '../types.ts';
import { isUnitClause, isUnSATClause, type ClauseEval } from '$lib/entities/Clause.svelte.ts';

// ** state inputs **

export type DPLL_EMPTY_CLAUSE_INPUT = 'unit_clauses_detection_state' | 'unsat_state';

export type DPLL_UNIT_CLAUSES_DETECTION_INPUT = 'queue_occurrence_list_state';

export type DPLL_PICK_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT =
	| 'all_variables_assigned_state'
	| 'pick_clause_set_state';

export type DPLL_QUEUE_OCCURRENCE_LIST_INPUT =
	| 'check_pending_occurrence_lists_state'
	| 'delete_clause_state';

export type DPLL_UNSTACK_CLAUSE_SET_INPUT = 'check_pending_occurrence_lists_state';

export type DPLL_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';

export type DPLL_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'unstack_clause_set_state';

export type DPLL_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type DPLL_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'empty_occurrence_lists_state';

export type DPLL_UNIT_CLAUSE_INPUT = 'delete_clause_state' | 'unit_propagation_state';

export type DPLL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type DPLL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';

export type DPLL_CHECK_NON_DECISION_MADE_INPUT = 'backtracking_state' | 'unsat_state';

export type DPLL_BACKTRACKING_INPUT = 'complementary_occurrences_state';

export type DPLL_DECIDE_INPUT = 'complementary_occurrences_state';

export type DPLL_EMPTY_OCCURRENCE_LISTS_INPUT = 'decision_level_state';

export type DPLL_INPUT =
	| DPLL_EMPTY_CLAUSE_INPUT
	| DPLL_UNIT_CLAUSES_DETECTION_INPUT
	| DPLL_PICK_CLAUSE_SET_INPUT
	| DPLL_ALL_VARIABLES_ASSIGNED_INPUT
	| DPLL_QUEUE_OCCURRENCE_LIST_INPUT
	| DPLL_UNSTACK_CLAUSE_SET_INPUT
	| DPLL_ALL_CLAUSES_CHECKED_INPUT
	| DPLL_NEXT_CLAUSE_INPUT
	| DPLL_CONFLICT_DETECTION_INPUT
	| DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	| DPLL_DELETE_CLAUSE_INPUT
	| DPLL_UNIT_CLAUSE_INPUT
	| DPLL_UNIT_PROPAGATION_INPUT
	| DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	| DPLL_CHECK_NON_DECISION_MADE_INPUT
	| DPLL_BACKTRACKING_INPUT
	| DPLL_DECIDE_INPUT
	| DPLL_EMPTY_OCCURRENCE_LISTS_INPUT;

// ** state functions **

export type DPLL_DECIDE_FUN = () => number;

export const decide: DPLL_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	return solverDecide(pool, 'dpll');
};

export type DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: DPLL_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type DPLL_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: DPLL_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverEmptyClauseDetection(pool);
};

export type DPLL_QUEUE_OCCURRENCE_LIST_FUN = (
	literal: number,
	clauses: SvelteSet<number>,
	solverStateMachine: DPLL_SolverMachine
) => number;

export const queueOccurrenceList: DPLL_QUEUE_OCCURRENCE_LIST_FUN = (
	literal: number,
	clauses: SvelteSet<number>,
	solverStateMachine: DPLL_SolverMachine
) => {
	const occurrenceList: OccurrenceList = { clauses, literal };
	solverStateMachine.postpone(occurrenceList);
	return solverStateMachine.leftToPostpone();
};

export type DPLL_UNSTACK_OCCURRENCE_LIST_FUN = (solverStateMachine: DPLL_SolverMachine) => void;

export const unstackOccurrenceList: DPLL_UNSTACK_OCCURRENCE_LIST_FUN = (
	solverStateMachine: DPLL_SolverMachine
) => {
	return solverStateMachine.resolvePostponed();
};

export type DPLL_UNIT_CLAUSES_DETECTION_FUN = () => SvelteSet<number>;

export const unitClauseDetection: DPLL_UNIT_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverUnitClauseDetection(pool);
};

export type DPLL_DELETE_CLAUSE_FUN = (clauses: SvelteSet<number>, clauseTag: number) => void;

export const deleteClause: DPLL_DELETE_CLAUSE_FUN = (
	clauses: SvelteSet<number>,
	clauseTag: number
) => {
	if (!clauses.has(clauseTag)) {
		logFatal('Clause not found', `Clause - ${clauseTag} not found`);
	}
	clauses.delete(clauseTag);
};

export type DPLL_PICK_CLAUSE_SET_FUN = (
	solverStateMachine: DPLL_SolverMachine
) => SvelteSet<number>;

export const pickClauseSet: DPLL_PICK_CLAUSE_SET_FUN = (solverStateMachine: DPLL_SolverMachine) => {
	const { clauses, literal }: OccurrenceList = solverStateMachine.consultPostponed();
	updateClausesToCheck(clauses, literal);
	return clauses;
};

export type DPLL_ALL_CLAUSES_CHECKED_FUN = (clauses: SvelteSet<number>) => boolean;

export const allClausesChecked: DPLL_ALL_CLAUSES_CHECKED_FUN = (clauses: SvelteSet<number>) => {
	return clauses.size === 0;
};

export type DPLL_NEXT_CLAUSE_FUN = (clauses: SvelteSet<number>) => number;

export const nextClause: DPLL_NEXT_CLAUSE_FUN = (clauses: SvelteSet<number>) => {
	if (clauses.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = clauses.values().next();
	const clauseTag = clausesIterator.value;
	return clauseTag as number;
};

export type DPLL_CONFLICT_DETECTION_FUN = (clauseTag: number) => boolean;

export const unsatisfiedClause: DPLL_CONFLICT_DETECTION_FUN = (clauseTag: number) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseTag);
	return isUnSATClause(evaluation);
};

export type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: DPLL_SolverMachine
) => boolean;

export const thereAreJobPostponed: DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: DPLL_SolverMachine
) => {
	return solverStateMachine.thereArePostponed();
};

export type DPLL_UNIT_CLAUSE_FUN = (clauseTag: number) => boolean;

export const unitClause: DPLL_UNIT_CLAUSE_FUN = (clauseTag: number) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseTag);
	return isUnitClause(evaluation);
};

export type DPLL_UNIT_PROPAGATION_FUN = (clauseTag: number) => number;

export const unitPropagation: DPLL_UNIT_PROPAGATION_FUN = (clauseTag: number) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, clauseTag, 'up');
};

export type DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => SvelteSet<number>;

export const complementaryOccurrences: DPLL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: OccurrencesList = getMapping();
	return solverComplementaryOccurrences(mapping, literal);
};

export type DPLL_CHECK_NON_DECISION_MADE_FUN = () => boolean;

export const nonDecisionMade: DPLL_CHECK_NON_DECISION_MADE_FUN = () => {
	return solverNonDecisionMade();
};

export type DPLL_BACKTRACKING_FUN = () => number;

export const backtracking: DPLL_BACKTRACKING_FUN = () => {
	const pool: VariablePool = getVariablePool();
	return solverBacktracking(pool);
};

export type DPLL_EMPTY_OCCURRENCE_LISTS_FUN = (solverStateMachine: DPLL_SolverMachine) => void;

export const emptyOccurrenceLists: DPLL_EMPTY_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: DPLL_SolverMachine
) => {
	while (solverStateMachine.leftToPostpone() > 0) {
		solverStateMachine.resolvePostponed();
	}
	cleanClausesToCheck();
};

export type DPLL_FUN =
	| DPLL_EMPTY_CLAUSE_FUN
	| DPLL_UNIT_CLAUSES_DETECTION_FUN
	| DPLL_PICK_CLAUSE_SET_FUN
	| DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN
	| DPLL_ALL_VARIABLES_ASSIGNED_FUN
	| DPLL_QUEUE_OCCURRENCE_LIST_FUN
	| DPLL_UNSTACK_OCCURRENCE_LIST_FUN
	| DPLL_DELETE_CLAUSE_FUN
	| DPLL_NEXT_CLAUSE_FUN
	| DPLL_CONFLICT_DETECTION_FUN
	| DPLL_UNIT_CLAUSE_FUN
	| DPLL_UNIT_PROPAGATION_FUN
	| DPLL_COMPLEMENTARY_OCCURRENCES_FUN
	| DPLL_CHECK_NON_DECISION_MADE_FUN
	| DPLL_BACKTRACKING_FUN
	| DPLL_DECIDE_FUN
	| DPLL_EMPTY_OCCURRENCE_LISTS_FUN;
