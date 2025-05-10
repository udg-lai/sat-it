import {
	emptyClauseDetection as solverEmptyClauseDetection,
	unitClauseDetection as solverUnitClauseDetection
} from '$lib/transversal/algorithms/solver-functions.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { type Eval } from '$lib/transversal/interfaces/IClausePool.ts';

export type DPLL_STATE_FUN = DPPL_EC_FUN | DPLL_UCD_FUN | DPLL_PENDING_CLAUSES_FUN | DPLL_OBTAIN_PENDING_CLAUSE_FUN;

export type DPLL_EC_INPUT = 'ucd_state' | 'unsat_state';

export type DPLL_UCD_INPUT = 'pending_clauses_state';

export type DPLL_OBTAIN_PENDING_CLAUSE_INPUT = 'pending_clauses_state' | 'check_state';

export type DPLL_PENDING_CLAUSES_INPUT = 'all_assigned_state' | 'obtain_pending_clause_state';

export type DPLL_STATE_INPUT = DPLL_EC_INPUT | DPLL_UCD_INPUT | DPLL_PENDING_CLAUSES_INPUT | DPLL_OBTAIN_PENDING_CLAUSE_INPUT; // conflict detection

export type DPPL_EC_FUN = (pool: ClausePool) => Eval;

export const emptyClauseDetection: DPPL_EC_FUN = (pool: ClausePool) => {
	return solverEmptyClauseDetection(pool);
};

export type DPLL_PENDING_CLAUSES_FUN = (pendingClauses: Set<number>[]) => Set<number> | undefined;

// we check if there are still clauses to check
export type DPLL_OBTAIN_PENDING_CLAUSE_FUN = (clauses: Set<number>) => number | undefined;

export const obtainPendingClause:  DPLL_OBTAIN_PENDING_CLAUSE_FUN = (clauses: Set<number>) => {
		const clausesIterator = clauses.values().next();
		const clauseId = clausesIterator.value;
		if (clauseId !== undefined) {
			clauses.delete(clauseId);
		}
		return clauseId;
}

// unit clause detection
export type DPLL_UCD_FUN = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UCD_FUN = (pool: ClausePool) => {
	return solverUnitClauseDetection(pool);
};

export const nextPendingClause = (pendingClause: Set<number>[]): Set<number> | undefined => {
	return pendingClause.length === 0 ? undefined : pendingClause[0];
};
