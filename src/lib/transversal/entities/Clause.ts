import logicResolution from '../algorithms/resolution.ts';
import type Literal from './Literal.svelte.ts';
import TemporalClause from './TemporalClause.ts';

class Clause extends TemporalClause {
	private static idGenerator: number = 0;
	private id: number;

	constructor(literals: Literal[] = []) {
		super(literals);
		this.id = this.generateUniqueId();
	}

	static resetUniqueIdGenerator() {
		Clause.idGenerator = 0;
	}

	static nextUniqueId() {
		return Clause.idGenerator;
	}

	generateUniqueId() {
		const id = Clause.idGenerator;
		Clause.idGenerator += 1;
		return id;
	}

	getId(): number {
		return this.id;
	}

	setId(newId: number): void {
		this.id = newId;
	}

	override resolution(other: TemporalClause): Clause {
		const result: TemporalClause = logicResolution(this, other);
		return new Clause(result.getLiterals());
	}
}

export interface SATClause {
	type: 'SAT';
}

export interface UnSATClause {
	type: 'UnSAT';
}

export interface UNITClause {
	type: 'UNIT';
	literal: number;
}

export interface UNRESOLVEDClause {
	type: 'UNRESOLVED';
}

export type ClauseEval = SATClause | UnSATClause | UNITClause | UNRESOLVEDClause;

export const makeSatClause = (): SATClause => {
	return { type: 'SAT' };
};

export const makeUnSATClause = (): UnSATClause => {
	return { type: 'UnSAT' };
};

export const makeUnitClause = (literal: number): UNITClause => {
	return { type: 'UNIT', literal };
};

export const makeUnresolvedClause = (): UNRESOLVEDClause => {
	return { type: 'UNRESOLVED' };
};

export const isUnSATClause = (e: ClauseEval): e is UnSATClause => {
	return e.type === 'UnSAT';
};

export const isSatClause = (e: ClauseEval): e is SATClause => {
	return e.type === 'SAT';
};

export const isUnresolvedClause = (e: ClauseEval): e is UNRESOLVEDClause => {
	return e.type === 'UNRESOLVED';
};

export const isUnitClause = (e: ClauseEval): e is UNITClause => {
	return e.type === 'UNIT';
};

export default Clause;
