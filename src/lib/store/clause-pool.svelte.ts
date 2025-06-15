import type Clause from '$lib/transversal/entities/Clause.ts';
import TemporalClause from '$lib/transversal/entities/TemporalClause.ts';

let defaultClauses: TemporalClause[] = $state([]);

export const setDefaultClauses = (clauses: Clause[]) => {
	defaultClauses = [];
	for (const clause of clauses) {
		defaultClauses.push(clause.toTemporalClause());
	}
};

export const getDefaultClauses = () => defaultClauses;

let conflictClause: TemporalClause | undefined = $state(undefined);

export const setConflictClause = (cc: TemporalClause) => {
	conflictClause = cc;
};

export const getConflictClause = () => conflictClause;
