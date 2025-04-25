import type Clause from '$lib/transversal/entities/Clause.ts';

export interface IClausePool {
	eval(): Eval;
	addClause(caluse: Clause): void;
	get(clause: number): Clause;
	getUnitClauses(): Set<Clause>;
	getClauses(): Clause[];
	size(): number;
}

export type Unsat = {
	type: 'UNSAT';
	conflicClause: number;
};

export type Sat = {
	type: 'SAT';
};

export type Unresolved = {
	type: 'UNRESOLVED';
};

export type Eval = Unsat | Sat | Unresolved;
