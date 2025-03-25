import type Clause from '$lib/transversal/entities/Clause.ts';

export interface IClausePool {
	poolCapacity: number;

	eval(): Eval;
	addClause(caluse: Clause): void;
	removeClause(clause: number): void;
	get(clause: number): Clause;
	getUnitClauses(): Set<Clause>;
	getClauses(): Clause[];
}

export enum Eval {
	UNSAT,
	SAT,
	UNRESOLVED
}
