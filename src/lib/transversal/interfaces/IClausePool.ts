import type Clause from '$lib/transversal/entities/Clause.ts';

export interface IClausePool {
	eval(): Eval;
	addClause(clause: Clause): void;
	get(clause: number): Clause;
	getUnitClauses(): Set<number>;
	getClauses(): Clause[];
	size(): number;
}

type UnSAT = {
	type: 'UnSAT';
	conflictClause: number;
};

type Sat = {
	type: 'SAT';
};

type Unresolved = {
	type: 'UNRESOLVED';
};

export type Eval = UnSAT | Sat | Unresolved;

export const isUnSAT = (e: Eval): e is UnSAT => {
	return e.type === 'UnSAT';
};

export const isSAT = (e: Eval): e is Sat => {
	return e.type === 'SAT';
};

export const isUnresolved = (e: Eval): e is Unresolved => {
	return e.type === 'UNRESOLVED';
};

export const makeUnSAT = (conflictClause: number): UnSAT => {
	return { type: 'UnSAT', conflictClause };
};

export const makeSat = (): Sat => {
	return { type: 'SAT' };
};

export const makeUnresolved = (): Unresolved => {
	return { type: 'UNRESOLVED' };
};
