import { logFatal } from '$lib/store/toasts.ts';
import { makeJust, makeNothing, type Maybe } from '../types/maybe.ts';
import Variable, { type Assignment } from './Variable.svelte.ts';

export interface IVariablePool {
	allAssigned(): boolean;
	nextVariableToAssign(): Maybe<number>;
	assign(variableId: number, assignment: Assignment): void;
	assignByLiteral(literal: number): void;
	unassign(variableId: number): void;
	getVariable(variable: number): void;
	getVariableCopy(variable: number): Variable;
	nextVariable(): number | undefined;
	reset(): void;
	allAssigned(): boolean;
	size(): number;
	includes(varId: number): boolean;
}

export class VariablePool implements IVariablePool {
	private variables: Variable[] = $state([]);
	private capacity: number = 0;
	private nvPointer: number = $state(0);

	constructor(nVariables: number) {
		this.variables = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
		this.capacity = nVariables;
		this.nvPointer = 0;
	}

	reset(): void {
		this.variables.forEach((variable) => variable.assign(undefined));
		this.nvPointer = 0;
	}

	nextVariableToAssign(): Maybe<number> {
		return this.getNextId();
	}

	allAssigned(): boolean {
		// Edit: Now the pointer is always looking at the variable that is going to be assigned
		return this.nvPointer === this.capacity;
	}

	unassign(variableId: number): void {
		this.assign(variableId, undefined);
	}

	assignByLiteral(literal: number): void {
		const variable = Math.abs(literal);
		this.checkIndex(variable);
		const polarity = literal > 0;
		this.assign(variable, polarity);
	}

	assign(variableId: number, assignment: Assignment): void {
		const varIndex: number = this.checkIndex(variableId);
		const variable: Variable = this.variables[varIndex];
		const pAssignment: Assignment = variable.getAssignment();
		if (pAssignment !== undefined) {
			this.updateNextVarPointer(varIndex, undefined);
		}
		variable.assign(assignment);
		this.updateNextVarPointer(varIndex, assignment);
	}

	nextVariable(): number | undefined {
		return this.variables.at(this.nvPointer)?.getInt();
	}

	getVariable(variable: number): Variable {
		const idx = this.checkIndex(variable);
		return this.variables[idx];
	}

	getVariableCopy(variable: number): Variable {
		return this.getVariable(variable).copy();
	}

	nVariables(): number {
		return this.capacity;
	}

	assignedVariables(): number[] {
		return this.variables.filter((v) => v.isAssigned()).map((v) => v.getInt());
	}

	nonAssignedVariables(): number[] {
		return this.variables.filter((v) => !v.isAssigned()).map((v) => v.getInt());
	}

	includes(varId: number): boolean {
		return varId >= 1 && varId <= this.size();
	}

	size(): number {
		return this.capacity;
	}

	private updateNextVarPointer(varIndex: number, assignment: Assignment) {
		if (assignment === undefined) {
			this.nvPointer = Math.min(varIndex, this.nvPointer);
		} else {
			if (this.nvPointer === varIndex) {
				while (this.nvPointer < this.capacity && this.variables[this.nvPointer].isAssigned()) {
					this.nvPointer++;
				}
			}
		}
	}

	private getNextId(): Maybe<number> {
		let nextFound = false;
		while (this.nvPointer < this.capacity && !nextFound) {
			const assigned = this.variables[this.nvPointer].isAssigned();
			if (!assigned) {
				nextFound = true;
			} else {
				this.nvPointer++;
			}
		}
		return nextFound ? makeJust(this.variables[this.nvPointer].getInt()) : makeNothing();
	}

	private checkIndex(variableId: number): number {
		const idx = this.variableToIndex(variableId);
		if (idx < 0 || idx >= this.variables.length)
			logFatal('Assignment error', 'Trying to obtain an out-of-range variable from the table');
		return idx;
	}

	private variableToIndex(variableId: number): number {
		return variableId - 1;
	}
}
