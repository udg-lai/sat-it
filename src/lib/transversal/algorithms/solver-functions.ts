import type ClausePool from '../entities/ClausePool.svelte.ts';
import type { Eval } from '../interfaces/IClausePool.ts';

export const emptyClauseDetection = (pool: ClausePool): Eval => {
	const evaluation = pool.eval();
	return evaluation;
};

export const unitClauseDetection = (pool: ClausePool): Set<number> => {
	const unitClauses: Set<number> = pool.getUnitClauses();
	return unitClauses;
};
