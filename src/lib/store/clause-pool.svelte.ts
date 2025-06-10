import type Clause from '$lib/transversal/entities/Clause.ts';
import type TemporalClause from '$lib/transversal/entities/TemporalClause.ts';

let defaultcClauses: Clause[] = $state([]);

export const setDefaultClauses = (clauses: Clause[]) => {
	defaultcClauses = clauses;
};

export const getDefaultClauses = () => defaultcClauses;

let conclictClause: TemporalClause | undefined = $state(undefined);

export const setConflictClause = (cc: TemporalClause) => {
	conclictClause = cc;
};

export const getConflictClause = () => conclictClause;
