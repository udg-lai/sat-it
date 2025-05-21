// **state inputs **

import { problemStore, type MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import {
	emptyClauseDetection as solverEmptyClauseDetection,
	allAssigned as solverAllAssigned,
	decide as solverDecide,
	complementaryOccurrences as solverComplementaryOccurrences,
	triggeredClauses as solverTriggeredClauses
} from '$lib/transversal/algorithms/solver.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { SvelteSet } from 'svelte/reactivity';
import { get } from 'svelte/store';
import type { BKT_SolverMachine } from './bkt-solver-machine.ts';
import { logFatal } from '$lib/transversal/logging.ts';

export type BKT_EMPTY_CLAUSE_INPUT = 'all_variables_assigned_state' | 'unsat_state';

export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';

export type BKT_COMPLEMENTARY_OCCURRENCES_INPUT = 'triggered_clauses_state';

export type BKT_TRIGGERED_CLAUSES_INPUT = 'queue_clause_set_state' | 'all_variables_assigned_state';

export type BKT_QUEUE_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type BKT_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'all_variables_assigned_state';

export type BKT_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSE_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT
	| BKT_COMPLEMENTARY_OCCURRENCES_INPUT
	| BKT_TRIGGERED_CLAUSES_INPUT
	| BKT_QUEUE_CLAUSE_SET_INPUT
	| BKT_ALL_CLAUSES_CHECKED_INPUT
	| BKT_NEXT_CLAUSE_INPUT;

// ** state functions **

export type BKT_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: BKT_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = get(problemStore).clauses;
	return solverEmptyClauseDetection(pool);
};

export type BKT_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: BKT_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = get(problemStore).variables;
	return solverAllAssigned(pool);
};

export type BKT_DECIDE_FUN = () => number;

export const decide: BKT_DECIDE_FUN = () => {
	const pool: VariablePool = get(problemStore).variables;
	return solverDecide(pool, 'dpll');
};

export type BKT_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => SvelteSet<number>;

export const complementaryOccurrences: BKT_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: MappingLiteral2Clauses = get(problemStore).mapping;
	return solverComplementaryOccurrences(mapping, literal);
};

export type BKT_TRIGGERED_CLAUSES_FUN = (clauses: SvelteSet<number>) => boolean;

export const triggeredClauses: BKT_TRIGGERED_CLAUSES_FUN = (clauses: SvelteSet<number>) => {
	return solverTriggeredClauses(clauses);
};

export type BKT_QUEUE_CLAUSE_SET_FUN = (
	clauses: SvelteSet<number>,
	solverStateMachine: BKT_SolverMachine
) => void;

export const queueClauseSet: BKT_QUEUE_CLAUSE_SET_FUN = (
	clauses: SvelteSet<number>,
	solverStateMachine: BKT_SolverMachine
) => {
	if (clauses.size === 0) {
		logFatal('Empty set of clauses are not thought to be queued');
	}
	solverStateMachine.enqueue(clauses);
};

export type BKT_ALL_CLAUSES_CHECKED_FUN = (solverStateMachine: BKT_SolverMachine) => boolean;

export const allClausesChecked: BKT_ALL_CLAUSES_CHECKED_FUN = (
	solverStateMachine: BKT_SolverMachine
) => {
	return solverStateMachine.pending.size === 0;
};

export type BKT_NEXT_CLAUSE_FUN = (solverStateMachine: BKT_SolverMachine) => number;

export const nextClause: BKT_NEXT_CLAUSE_FUN = (solverStateMachine: BKT_SolverMachine) => {
	if (solverStateMachine.pending.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = solverStateMachine.pending.values().next();
	const clauseId = clausesIterator.value;
	return clauseId as number;
};

export type BKT_FUN =
	| BKT_EMPTY_CLAUSE_FUN
	| BKT_ALL_VARIABLES_ASSIGNED_FUN
	| BKT_DECIDE_FUN
	| BKT_COMPLEMENTARY_OCCURRENCES_FUN
	| BKT_TRIGGERED_CLAUSES_FUN
	| BKT_QUEUE_CLAUSE_SET_FUN
	| BKT_ALL_CLAUSES_CHECKED_FUN
	| BKT_NEXT_CLAUSE_FUN;
