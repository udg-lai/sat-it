import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { type Eval, makeSat } from '$lib/transversal/interfaces/IClausePool.ts';

export type DPLL_STATE_FUN = DPPL_EC | DPLL_UCD;

export type EC_STATE_INPUT = 'ucd';

export type UCD_STATE_INPUT = 'nothing';

export type DPLL_STATE_INPUT = EC_STATE_INPUT | UCD_STATE_INPUT;

// conflict detection
export type DPPL_EC = (pool: ClausePool) => Eval;

export const emptyClayseDetection: DPPL_EC = (pool: ClausePool) => {
	return makeSat();
};

// unit clause detection
export type DPLL_UCD = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UCD = (pool: ClausePool) => {
	return new Set();
};
