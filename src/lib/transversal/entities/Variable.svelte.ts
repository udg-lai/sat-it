import type { Comparable } from '../interfaces/Comparable.ts';
import { logFatal } from '$lib/store/toasts.ts';

export type Assignment = boolean | undefined;

export default class Variable implements Comparable<Variable> {
	private id: number;
	private assignment: Assignment = $state(undefined);

	constructor(id: number, assignment: Assignment = undefined) {
		if (id < 0) throw 'ERROR: variable ID should be >= 0';
		this.id = id;
		this.assignment = assignment;
	}

	getInt(): number {
		return this.id;
	}

	isAssigned(): boolean {
		return this.assignment !== undefined;
	}

	isNotAssigned(): boolean {
		return !this.isAssigned();
	}

	getAssignment(): Assignment {
		return this.assignment;
	}

	unassign(): void {
		this.assign(undefined);
	}

	assign(assignment: Assignment): void {
		this.assignment = assignment;
	}

	negate(): void {
		if (this.isNotAssigned()) {
			logFatal('You can not negate the assignment of a non assigned variable');
		} else {
			this.assign(!this.assignment);
		}
	}

	copy(): Variable {
		const newVariable = new Variable(this.id, this.assignment);
		return newVariable;
	}

	equals(other: Variable): boolean {
		return this.id === other.id;
	}
}
