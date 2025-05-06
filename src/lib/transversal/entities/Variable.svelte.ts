import type { Comparable } from '../interfaces/Comparable.ts';
import { logFatal } from '../logging.ts';

export default class Variable implements Comparable<Variable> {
	private id: number;
	private assignment: boolean | undefined;

	constructor(id: number, assignment: boolean | undefined = undefined) {
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

	getAssignment(): boolean {
		if (this.assignment === undefined) {
			logFatal('Evaluation of an undefined variable');
		}
		return this.assignment;
	}

	assign(assignment: boolean): void {
		this.assignment = assignment;
	}

	unassign(): void {
		this.assignment = undefined;
	}

	negate(): void {
		if (this.isNotAssigned()) {
			logFatal('You can not negate the assigment of a non assigned variable');
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
