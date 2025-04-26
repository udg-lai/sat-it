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
	type: 'UNSAT';
	conflictClause: number;
};

type Sat = {
	type: 'SAT';
};

type Unresolved = {
	type: 'UNRESOLVED';
};

export type Eval = Unsat | Sat | Unresolved;

export const isUnsat = (e: Eval): e is Unsat => {
	return e.type === 'UNSAT';
};

export const isSat = (e: Eval): e is Sat => {
	return e.type === 'SAT';
};

export const isUnresolved = (e: Eval): e is Unsat => {
	return e.type === 'UNRESOLVED';
};

export const makeUnsat = (conflictClause: number): Unsat => {
	return { type: 'UNSAT', conflictClause };
};

export const makeSat = (): Sat => {
	return { type: 'SAT' };
};

export const makeUnresolved = (): Unresolved => {
	return { type: 'UNRESOLVED' };
};
