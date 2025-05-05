import type Literal from './Literal.svelte.ts';
import logicResolution from '../algorithms/resolution.ts';
import { arraysEqual } from '../types/array.ts';
import type { Comparable } from '../utils/interfaces/Comparable.ts';

class Clause implements Comparable<Clause> {
	private static idGenerator: number = 0;

	private literals: Literal[] = [];
	private id: number;

	constructor(literals: Literal[] = []) {
		this.id = this.generateUniqueId();
		this.literals = literals;
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

	addLiteral(lit: Literal) {
		this.literals.push(lit);
	}

	removeLiteral(lit: Literal) {
		this.literals = this.literals.filter((l) => l.getId() != lit.getId());
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

	private optimalCheckUnit(): boolean {
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
