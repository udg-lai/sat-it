import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import type { Lit, Var } from '$lib/types/types.ts';
import type { Comparable } from '../interfaces/Comparable.ts';

export type Assignment = boolean | undefined;

export default class Variable implements Comparable<Variable> {
	private id: number;
	private assignment: Assignment = $state(undefined);

	constructor(id: number, assignment: Assignment = undefined) {
		if (id <= 0) logError('Variable Initialization', 'Variable id cannot be negative or zero');
		this.id = id;
		this.assignment = assignment;
	}

	toInt(): Var {
		return this.id;
	}

	toLit(): Lit {
		if (!this.hasTruthValue())
			logFatal('Variable to literal representation', 'variable has no truth value assigned');
		return this.assignment ? this.id : -1 * this.id;
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
		return new Variable(this.id, this.assignment);
	}

	equals(other: Variable): boolean {
		return this.id === other.id;
	}
}
