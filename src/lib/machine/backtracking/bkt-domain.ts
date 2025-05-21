// **state inputs **

import { problemStore } from '$lib/store/problem.store.ts';
import {
	emptyClauseDetection as solverEmptyClauseDetection,
	allAssigned as solverAllAssigned,
	decide as solverDecide
} from '$lib/transversal/algorithms/solver.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { get } from 'svelte/store';

export type BKT_EMPTY_CLAUSE_INPUT = 'all_variables_assigned_state' | 'unsat_state';

export type BKT_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type BKT_DECIDE_INPUT = 'complementary_occurrences_state';

export type BKT_INPUT =
	| BKT_EMPTY_CLAUSE_INPUT
	| BKT_ALL_VARIABLES_ASSIGNED_INPUT
	| BKT_DECIDE_INPUT;

// ** state functions

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

export type BKT_FUN = BKT_EMPTY_CLAUSE_FUN | BKT_ALL_VARIABLES_ASSIGNED_FUN | BKT_DECIDE_FUN;
