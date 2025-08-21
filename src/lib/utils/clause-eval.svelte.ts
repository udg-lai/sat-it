import type {
	ClauseEval,
	SATClause,
	UNITClause,
	UNRESOLVEDClause,
	UnSATClause
} from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { clauseEvaluation } from '$lib/solvers/shared.svelte.ts';
import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';

const problem: Problem = $derived(getProblemStore());

export const isUnSATClause = (e: ClauseEval): e is UnSATClause => {
	return e.type === 'UnSAT';
};

export const isSatClause = (e: ClauseEval): e is SATClause => {
	return e.type === 'SAT';
};

export const isUnresolvedClause = (e: ClauseEval): e is UNRESOLVEDClause => {
	return e.type === 'UNRESOLVED';
};

export const isUnitClause = (e: ClauseEval): e is UNITClause => {
	return e.type === 'UNIT';
};

export const isUnitClauseByTag = (clauseTag: number): boolean => {
	const pool: ClausePool = problem.clauses;
	const e: ClauseEval = clauseEvaluation(pool, clauseTag);
	return e.type === 'UNIT';
};
