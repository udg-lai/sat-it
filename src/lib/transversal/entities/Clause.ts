import type Literal from './Literal.svelte.ts';
import logicResolution from '../algorithms/resolution.ts';
import { v4 as uuidv4 } from 'uuid';
import { arraysEqual } from '../utils/types/array.ts';
import type { Comparable } from '../utils/interfaces/Comparable.ts';

class Clause implements Comparable<Clause> {
	literals: Literal[] = [];
	id: string;

	constructor(literals: Literal[]) {
		this.id = uuidv4();
		this.literals = literals;
	}

	public addLiteral(lit: Literal) {
		this.literals.push(lit);
	}

	public removeLiteral(lit: Literal) {
		this.literals = this.literals.filter((l) => l.getId() != lit.getId());
	}

	public eval(): ClauseEval {
		let state = ClauseEval.UNRESOLVED;
		let i = 0;
		let unsatCount = 0;
		while (i < this.literals.length && state !== ClauseEval.SAT) {
			const lit: Literal = this.literals[i];
			if (lit.isTrue()) state = ClauseEval.SAT;
			else {
				if (lit.isFalse()) unsatCount++;
				i++;
			}
		}
		if (state !== ClauseEval.SAT) {
			state =
				unsatCount == i
					? ClauseEval.UNSAT
					: unsatCount == i - 1
						? ClauseEval.UNIT
						: ClauseEval.UNRESOLVED;
		}
		return state;
	}

	public isUndetermined(): boolean {
		return this.eval() === ClauseEval.UNRESOLVED;
	}

	public isSAT(): boolean {
		return this.eval() === ClauseEval.SAT;
	}

	public isUnSAT(): boolean {
		return this.eval() === ClauseEval.UNSAT;
	}

	public isUnit(): boolean {
		return this.eval() === ClauseEval.UNIT;
	}

	public resolution(other: Clause): Clause {
		return logicResolution(this, other);
	}

	public equals(other: Clause): boolean {
		const c1 = this.literals.map((l) => l.toInt());
		const c2 = other.literals.map((l) => l.toInt());
		return arraysEqual(c1.sort(), c2.sort());
	}

	[Symbol.iterator]() {
		return this.literals.values();
	}

	forEach(
		callback: (literal: Literal, index: number, array: Literal[]) => void,
		thisArg?: unknown
	): void {
		this.literals.forEach(callback, thisArg);
	}
}

export enum ClauseEval {
	UNSAT,
	SAT,
	UNIT,
	UNRESOLVED
}

export default Clause;
