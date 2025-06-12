import type Clause from '$lib/transversal/entities/Clause.ts';
import UnindexedClause from '$lib/transversal/entities/UnindexedClause.ts';

let defaultcClauses: UnindexedClause[] = $state([]);

export const setDefaultClauses = (clauses: Clause[]) => {
	defaultcClauses = [];
	for(const clause of clauses) {
		defaultcClauses.push(new UnindexedClause(clause.getLiterals()));
	}
};

export const getDefaultClauses = () => defaultcClauses;

let conclictClause: UnindexedClause | undefined = $state(undefined);

export const setConflictClause = (cc: UnindexedClause) => {
	conclictClause = cc;
};

export const getConflictClause = () => conclictClause;
