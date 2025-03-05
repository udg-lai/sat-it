import type { Comparable } from '../utils/interfaces/Comparable.ts';
import { isJust, makeJust, makeNothing, type Maybe } from '../utils/types/maybe.ts';

export default class Variable implements Comparable<Variable> {
	id: number;
	assignment: Maybe<boolean> = makeNothing();

	constructor(id: number, assignment: Maybe<boolean> = makeNothing()) {
		if (id < 0) throw 'ERROR: variable ID should be >= 0';
		this.id = id;
		this.assignment = assignment;
	}

	public getInt(): number {
		return this.id;
	}

	public isAssigned(): boolean {
		return isJust(this.assignment);
	}

	public getAssignment(): Maybe<boolean> {
		return this.assignment;
	}

	public assign(evaluation: boolean): void {
		this.assignment = makeJust(evaluation);
	}

	public unassign(): void {
		this.assignment = makeNothing();
	}

	public negate(): void {
		this.assign(!this.assignment);
	}

	public copy(): Variable {
		const newVariable = new Variable(this.id, this.assignment);
		return newVariable;
	}

	public equals(other: Variable): boolean {
		return this.id === other.id;
	}
}
