import logicResolution from '$lib/algorithms/resolution.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type { Comparable } from '../interfaces/Comparable.ts';
import type { Claim } from '../parsers/dimacs.ts';
import { arraysEqual } from '../types/array.ts';
import Literal from './Literal.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

type ClauseOptions = {
	comments?: string[];
	cr?: number;
	learned?: boolean;
};

class Clause implements Comparable<Clause> {
	private literals: Literal[] = [];
	private comments: string[] = $state([]);
	private cr: number | undefined;
	private learned: boolean = false;

	constructor(
		literals: Literal[],
		{ comments = [], cr = undefined, learned = false }: ClauseOptions = {}
	) {
		this.literals = literals;
		this.comments = comments;
		this.cr = cr;
		this.learned = learned;
	}

	static buildFrom(claim: Claim, variables: VariablePool): Clause {
		const literals: Literal[] = claim.literals.map((lit) => Literal.buildFrom(lit, variables));
		const comments = claim.comments;
		const tag: number | undefined = claim.id;
		return new Clause(literals, {
			comments,
			cr: tag,
			learned: false
		});
	}

	addLiteral(lit: Literal) {
		this.literals.push(lit);
	}

	getCRef(): CRef {
		// cRef can be undefined for temporal clauses, check if it is a temporal clause before using this method
		if (this.isTemporal()) {
			logFatal('Get CRef', 'Cannot get CRef of a temporal clause');
		}
		return this.cr as CRef;
	}

	setCRef(cr: number): void {
		this.cr = cr;
	}

	hasBeenLearned(): boolean {
		return this.learned;
	}

	setAsLearned(): void {
		this.learned = true;
	}

	isTemporal(): boolean {
		return this.cr === undefined;
	}

	fstUnassignedLiteral(): Literal {
		let i = 0;
		let literal: Literal | undefined = undefined;
		while (i < this.literals.length && !literal) {
			if (!this.literals[i].isAssigned()) {
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

	containsLiteral(literal: Lit): boolean {
		let found = false;
		for (const lit of this.literals) {
			if (lit.toInt() === literal) {
				found = true;
				break;
			}
		}
		return found;
	}

	getLiterals(): Literal[] {
		return [...this.literals];
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
		return new Clause(this.literals, {
			comments: [...this.comments],
			cr: this.cr,
			learned: this.learned
		});
	}

	isEmpty(): boolean {
		return this.literals.length === 0;
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
