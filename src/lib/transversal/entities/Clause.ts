import type Literal from './Literal.svelte.ts';
import logicResolution from '../algorithms/resolution.ts';
import { arraysEqual } from '../utils/types/array.ts';
import type { Comparable } from '../utils/interfaces/Comparable.ts';

class Clause implements Comparable<Clause> {
	private literals: Literal[] = [];
	private id: number;

	static idCounter: number = 0;

	constructor(literals: Literal[]) {
		this.id = Clause.idCounter++;
		this.literals = literals;
	}

	static setIdCounter(initialId: number) {
		Clause.idCounter = initialId;
	}

	setId(newId: number): void {
		this.id = newId;
	}

	addLiteral(lit: Literal) {
		this.literals.push(lit);
	}

	removeLiteral(lit: Literal) {
		this.literals = this.literals.filter((l) => l.id != lit.id);
	}

	eval(): ClauseEval {
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

	isUndetermined(): boolean {
		return this.eval() === ClauseEval.UNRESOLVED;
	}

	isSAT(): boolean {
		return this.eval() === ClauseEval.SAT;
	}

	isUnSAT(): boolean {
		return this.eval() === ClauseEval.UNSAT;
	}

	isUnit(): boolean {
		return this.eval() === ClauseEval.UNIT;
	}

	resolution(other: Clause): Clause {
		return logicResolution(this, other);
	}

	equals(other: Clause): boolean {
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
