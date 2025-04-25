import type Clause from '$lib/transversal/entities/Clause.ts';

export interface IClausePool {
	eval(): Eval;
	addClause(caluse: Clause): void;
	get(clause: number): Clause;
	getUnitClauses(): Set<Clause>;
	getClauses(): Clause[];
	size(): number;
}

type Unsat = {
	type: 'UNSAT',
	conflicClause: number
};

type Sat = {
	type: 'SAT'
};

type Unresolved = {
	type: 'UNRESOLVED'
}

export type Eval = Unsat | Sat | Unresolved;
