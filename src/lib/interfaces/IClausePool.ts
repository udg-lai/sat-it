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

export type AssignmentEval = UnSAT | Sat | Unresolved;

export const isUnSAT = (e: AssignmentEval): e is UnSAT => {
	return e.type === 'UnSAT';
};

export const isSAT = (e: AssignmentEval): e is Sat => {
	return e.type === 'SAT';
};

export const isUnresolved = (e: AssignmentEval): e is Unresolved => {
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
