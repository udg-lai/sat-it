import type Clause from '$lib/entities/Clause.svelte.ts';

let defaultClauses: Clause[] = $state([]);

export const setDefaultClauses = (clauses: Clause[]) => {
	defaultClauses = [...clauses];
};

export const getDefaultClauses = () => defaultClauses;

let conflictAnalysisClause: Clause | undefined = $state(undefined);

export const setConflictAnalysisClause = (cc: Clause) => {
	conflictAnalysisClause = cc;
};

export const getConflictAnalysisClause = () => conflictAnalysisClause;
