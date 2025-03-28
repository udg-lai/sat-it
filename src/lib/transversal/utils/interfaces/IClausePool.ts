import type Clause from '$lib/transversal/entities/Clause.ts';

export interface IClausePool {
	eval(): Eval;
	addClause(caluse: Clause): void;
	get(clause: number): Clause;
	getUnitClauses(): Set<Clause>;
	getClauses(): Clause[];
	size(): number
}

export enum Eval {
	UNSAT,
	SAT,
	UNRESOLVED
}
