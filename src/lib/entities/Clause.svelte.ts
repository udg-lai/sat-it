import { assertiveAlgorithm } from '$lib/algorithms/assertive.ts';
import logicResolution from '$lib/algorithms/resolution.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type { Comparable } from '../interfaces/Comparable.ts';
import type { Claim } from '../parsers/dimacs.ts';
import { arraysEqual } from '../types/array.ts';
import Literal from './Literal.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

export interface UNSATISFIED {
	type: 'SAT';
}

export interface SATISFIED {
	type: 'UnSAT';
}

export interface UNIT {
	type: 'UNIT';
	literal: number;
}

export interface UNRESOLVED {
	type: 'UNRESOLVED';
}

export type ClauseEval = UNSATISFIED | SATISFIED | UNIT | UNRESOLVED;

export const makeSatisfiedEval = (): UNSATISFIED => {
	return { type: 'SAT' };
};

export const makeUnsatisfiedEval = (): SATISFIED => {
	return { type: 'UnSAT' };
};

export const makeUnitEval = (literal: number): UNIT => {
	return { type: 'UNIT', literal };
};

export const makeUnresolvedEval = (): UNRESOLVED => {
	return { type: 'UNRESOLVED' };
};

export const isUnsatisfiedEval = (e: ClauseEval): e is SATISFIED => {
	return e.type === 'UnSAT';
};

export const isSatisfiedEval = (e: ClauseEval): e is UNSATISFIED => {
	return e.type === 'SAT';
};

export const isUnresolvedEval = (e: ClauseEval): e is UNRESOLVED => {
	return e.type === 'UNRESOLVED';
};

export const isUnitEval = (e: ClauseEval): e is UNIT => {
	return e.type === 'UNIT';
};

type ClauseOptions = {
	comments?: string[];
	cRef?: CRef;
	learned?: boolean;
};

export default class Clause implements Comparable<Clause> {
	private literals: Literal[] = [];
	private sortedLiterals: Literal[] = [];
	private comments: string[] = $state([]);
	private cRef: number | undefined;
	private learned: boolean = false;

	constructor(
		literals: Literal[],
		{ comments = [], cRef = undefined, learned = false }: ClauseOptions = {}
	) {
		this.literals = [...literals];
		this.sortedLiterals = [...literals];
		this.comments = comments;
		this.cRef = cRef;
		this.learned = learned;
	}

	static buildFrom(claim: Claim, variables: VariablePool): Clause {
		const literals: Literal[] = claim.literals.map((lit) => Literal.buildFrom(lit, variables));
		const comments = claim.comments;
		const tag: number | undefined = claim.id;
		return new Clause(literals, {
			comments,
			cRef: tag,
			learned: false
		});
	}

	getCRef(): CRef {
		// cRef can be undefined for temporal clauses, check if it is a temporal clause before using this method
		if (this.isTemporal()) {
			logFatal('Get CRef', 'Cannot get CRef of a temporal clause');
		}
		return this.cRef as CRef;
	}

	setCRef(cRef: CRef): void {
		this.cRef = cRef;
	}

	isLemma(): boolean {
		return this.learned;
	}

	setAsLemma(): void {
		this.learned = true;
	}

	isTemporal(): boolean {
		return this.cRef === undefined;
	}

	isAssertive(literals: Lit[]): boolean {
		return assertiveAlgorithm(this, literals);
	}

	fstUnassignedLiteral(): Literal {
		let i = 0;
		let literal: Literal | undefined = undefined;
		while (i < this.literals.length && !literal) {
			if (!this.literals[i].hasTruthValue()) {
				literal = this.literals[i];
			} else {
				i++;
			}
		}
		if (!literal) {
			logFatal('First unassigned literal', 'No unassigned literal found in clause');
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
				if (!lit.hasTruthValue()) unassignedLiterals.push(lit.toInt());
				i++;
			}
		}
		let state: ClauseEval;
		if (satisfied) state = makeSatisfiedEval();
		else if (unassignedLiterals.length === 1) state = makeUnitEval(unassignedLiterals[0]);
		else if (unassignedLiterals.length === 0) state = makeUnsatisfiedEval();
		else state = makeUnresolvedEval();

		return state;
	}

	falsified(): boolean {
		return this.isEmpty() || this.eval().type === 'UnSAT';
	}

	isUnit(): boolean {
		let nNotAssigned = 0;
		let i = 0;
		const len = this.literals.length;
		let satisfied = false;
		while (i < len && nNotAssigned < 2 && !satisfied) {
			const lit: Literal = this.literals[i];
			if (!lit.hasTruthValue()) {
				nNotAssigned += 1;
			} else {
				satisfied = lit.isTrue();
			}
			i++;
		}
		const unit = !satisfied && nNotAssigned == 1;
		return unit;
	}

	contains(literal: Lit): boolean {
		let found = false;
		for (const lit of this.literals) {
			if (lit.toInt() === literal) {
				found = true;
				break;
			}
		}
		return found;
	}

	getLiterals(sorted: boolean = false): Literal[] {
		if (sorted) return [...this.sortedLiterals];
		else return [...this.literals];
	}

	resolution(other: Clause): Clause {
		return logicResolution(this, other);
	}

	equals(other: Clause): boolean {
		const c1 = this.literals.map((l) => l.toInt());
		const c2 = other.literals.map((l) => l.toInt());
		return arraysEqual(c1.sort(), c2.sort());
	}

	size(): number {
		return this.literals.length;
	}

	getComments(): string[] {
		return this.comments;
	}

	copy(): Clause {
		return new Clause(this.sortedLiterals, {
			comments: [...this.comments],
			cRef: this.cRef,
			learned: this.learned
		});
	}

	swapLiteralPositions(i: number, j: number) {
		if (this.size() <= i || this.size() <= j) {
			logFatal('Swap issue', 'You are trying to change out of bound positions');
		} else {
			const aux: Literal = this.literals[i];
			this.literals[i] = this.literals[j];
			this.literals[j] = aux;
		}
	}

	isEmpty(): boolean {
		return this.literals.length === 0;
	}

	[Symbol.iterator]() {
		return this.sortedLiterals.values();
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

	toString(): string {
		return '{' + this.literals.map((lit: Literal) => lit.toString()).join(', ') + '}';
	}
}
