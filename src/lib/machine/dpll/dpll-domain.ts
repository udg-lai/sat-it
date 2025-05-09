import {
	emptyClauseDetection as solverEmptyClauseDetection,
	unitClauseDetection as solverUnitClauseDetection
} from '$lib/transversal/algorithms/solver-functions.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { type Eval } from '$lib/transversal/interfaces/IClausePool.ts';

export type DPLL_STATE_FUN = DPPL_EC | DPLL_UCD | DPLL_PENDING_CLAUSES;

export type EC_STATE_INPUT = 'ucd' | 'unsat';

export type UCD_STATE_INPUT = 'pendingClauses';

export type PENDING_CLAUSES_STATE_INPUT = 'allAssigned' | 'checkPending';

export type DPLL_STATE_INPUT = EC_STATE_INPUT | UCD_STATE_INPUT | PENDING_CLAUSES_STATE_INPUT;

// conflict detection
export type DPPL_EC = (pool: ClausePool) => Eval;

export const emptyClauseDetection: DPPL_EC = (pool: ClausePool) => {
	return solverEmptyClauseDetection(pool);
};

export type DPLL_PENDING_CLAUSES = (pendingClauses: Set<number>[]) => Set<number> | undefined;

// unit clause detection
export type DPLL_UCD = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UCD = (pool: ClausePool) => {
	return solverUnitClauseDetection(pool);
};

export const nextPendingClause = (pendingClause: Set<number>[]): Set<number> | undefined => {
	return pendingClause.length === 0 ? undefined : pendingClause[0];
};
