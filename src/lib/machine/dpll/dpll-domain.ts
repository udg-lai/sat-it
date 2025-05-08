import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { Eval } from '$lib/transversal/interfaces/IClausePool.ts';

export type DPLL_STATE_FUN = DPLL_CD | DPLL_UCD;

export type CD_STATE_INPUT = 'ucd';

export type UCD_STATE_INPUT = 'nothing';

export type DPLL_STATE_INPUT = CD_STATE_INPUT | UCD_STATE_INPUT;

// conflict detection
export type DPLL_CD = (pool: ClausePool) => Eval;

export const conflictDetection: DPLL_CD = (pool: ClausePool) => {
	return Eval.SAT;
};

// unit clause detection
export type DPLL_UCD = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UCD = (pool: ClausePool) => {
	return new Set();
};
