import type Clause from '$lib/entities/Clause.svelte.ts';
import type TemporalClause from '$lib/entities/TemporalClause.ts';

let defaultClauses: TemporalClause[] = $state([]);

export const setDefaultClauses = (clauses: Clause[]) => {
	defaultClauses = [];
	for (const clause of clauses) {
		defaultClauses.push(clause.toTemporalClause());
	}
};

export const getDefaultClauses = () => defaultClauses;

let conflictAnalysisClause: TemporalClause | undefined = $state(undefined);

export const setConflictAnalysisClause = (cc: TemporalClause) => {
	conflictAnalysisClause = cc;
};

export const getConflictAnalysisClause = () => conflictAnalysisClause;
