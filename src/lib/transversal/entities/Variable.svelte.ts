import type { Comparable } from '../interfaces/Comparable.ts';

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

	hasTruthValue(): boolean {
		return this.assignment !== undefined;
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
		if (this.hasTruthValue()) {
			this.assignment = !this.assignment;
		} else {
			this.assignment = undefined;
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
