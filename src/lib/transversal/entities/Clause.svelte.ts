import { logFatal } from '$lib/store/toasts.ts';
import type { Comparable } from '../interfaces/Comparable.ts';
import type { Claim } from '../parsers/dimacs.ts';
import { arraysEqual } from '../types/array.ts';
import Literal from './Literal.svelte.ts';
import TemporalClause from './TemporalClause.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

class Clause implements Comparable<Clause> {
	private literals: Literal[] = [];
	private comments: string[] = $state([]);

	constructor(literals: Literal[], comments: string[] = []) {
		this.literals = literals;
		this.comments = comments;
	}

	static buildFrom(claim: Claim, variables: VariablePool): Clause {
		const literals: Literal[] = claim.literals.map((lit) => Literal.buildFrom(lit, variables));
		const comments = claim.comments;
		return new Clause(literals, comments);
	}

	addLiteral(lit: Literal) {
		this.literals.push(lit);
	}

	findUnassignedLiteral(): number {
		let i = 0;
		let literal = undefined;
		while (i < this.literals.length && !literal) {
			if (!this.literals[i].isAssigned()) {
				literal = this.literals[i].toInt();
			} else {
				i++;
			}
		}
		if (!literal) {
			throw logFatal('Non unassigned literal was found');
		}
		return literal;
	}

	eval(): ClauseEval {
		let satisfied = false;
		const unassignedLiterals: number[] = [];

		let i = 0;
		while (i < this.literals.length && !satisfied) {
			const lit: Literal = this.literals[i];
			if (lit.isTrue()) satisfied = true;
			else {
				if (!lit.isAssigned()) unassignedLiterals.push(lit.toInt());
				i++;
			}
		}
		let state: ClauseEval;
		if (satisfied) state = makeSatClause();
		else if (unassignedLiterals.length === 1) state = makeUnitClause(unassignedLiterals[0]);
		else if (unassignedLiterals.length === 0) state = makeUnSATClause();
		else state = makeUnresolvedClause();

		return state;
	}

	isUnit(): boolean {
		return this.optimalCheckUnit();
	}

	containsVariable(variableId: number): boolean {
		const found = this.literals.find((lit) => {
			const id = lit.toInt();
			return Math.abs(id) === variableId;
		});
		return found !== undefined;
	}

	getLiterals(): Literal[] {
		return [...this.literals];
	}

	optimalCheckUnit(): boolean {
		let nNotAssigned = 0;
		let i = 0;
		const len = this.literals.length;
		let satisfied = false;
		while (i < len && nNotAssigned < 2 && !satisfied) {
			const lit: Literal = this.literals[i];
			if (!lit.isAssigned()) {
				nNotAssigned += 1;
			} else {
				satisfied = lit.isTrue();
			}
			i++;
		}
		const unit = !satisfied && nNotAssigned == 1;
		return unit;
	}

	resolution(other: Clause): Clause {
		const thisTemp: TemporalClause = new TemporalClause(this.getLiterals());
		const otherTemp: TemporalClause = new TemporalClause(other.getLiterals());
		const result: TemporalClause = thisTemp.resolution(otherTemp);
		return new Clause(result.getLiterals());
	}

	toTemporalClause(): TemporalClause {
		return new TemporalClause(this.getLiterals());
	}

	equals(other: Clause): boolean {
		const c1 = this.literals.map((l) => l.toInt());
		const c2 = other.literals.map((l) => l.toInt());
		return arraysEqual(c1.sort(), c2.sort());
	}

	nLiterals(): number {
		return this.literals.length;
	}

	getComments(): string[] {
		console.log($state.snapshot(this.comments))
		return this.comments;
	}

	[Symbol.iterator]() {
		return this.literals.values();
	}

	map<T>(
		callback: (literal: Literal, index: number, array: Literal[]) => T,
		thisArg?: unknown
	): T[] {
		return this.literals.map(callback, thisArg);
	}

	forEach(
		callback: (literal: Literal, index: number, array: Literal[]) => void,
		thisArg?: unknown
	): void {
		this.literals.forEach(callback, thisArg);
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
