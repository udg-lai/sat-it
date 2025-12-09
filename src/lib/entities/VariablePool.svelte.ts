import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { Var } from '$lib/types/types.ts';
import { makeJust, makeNothing, type Maybe } from '../types/maybe.ts';
import Variable, { type Assignment } from './Variable.svelte.ts';

export interface IVariablePool {
	allAssigned(): boolean;
	nextVariableToAssign(): Maybe<number>;
	assign(variableId: number, assignment: Assignment): void;
	unassign(variableId: number): void;
	getVariable(variable: number): void;
	wipe(): void;
	allAssigned(): boolean;
	size(): number;
	includes(variableId: number): boolean;
	assignedTruthValue(variableId: number): boolean;
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

	wipe(): void {
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

	unassign(varId: Var): void {
		this._assign(varId, undefined);
	}

	assign(variableId: number, assignment: Assignment): void {
		this._assign(variableId, assignment);
	}

	getVariable(variable: number): Variable {
		const idx = this.checkIndex(variable);
		return this.variables[idx];
	}

	includes(varId: number): boolean {
		return varId >= 1 && varId <= this.size();
	}

	size(): number {
		return this.capacity;
	}

	assignedTruthValue(variableId: number): boolean {
		return this._assignedTruthValue().has(variableId);
	}

	private _assignedTruthValue(): Set<number> {
		const assigned: number[] = this.variables
			.filter((v) => v.hasTruthValue())
			.map((v) => v.toInt());
		return new Set([...assigned]);
	}

	private _assign(varId: Var, assignment: Assignment): void {
		const varIndex: number = this.checkIndex(varId);
		const variable: Variable = this.variables[varIndex];
		const pAssignment: Assignment = variable.getAssignment();
		if (pAssignment !== undefined) {
			this.updateNextVarPointer(varIndex, undefined);
		}
		variable.assign(assignment);
		this.updateNextVarPointer(varIndex, assignment);
	}

	private updateNextVarPointer(varIndex: number, assignment: Assignment) {
		if (assignment === undefined) {
			this.nvPointer = Math.min(varIndex, this.nvPointer);
		} else {
			if (this.nvPointer === varIndex) {
				while (this.nvPointer < this.capacity && this.variables[this.nvPointer].hasTruthValue()) {
					this.nvPointer++;
				}
			}
		}
	}

	private getNextId(): Maybe<number> {
		let nextFound = false;
		while (this.nvPointer < this.capacity && !nextFound) {
			const assigned = this.variables[this.nvPointer].hasTruthValue();
			if (!assigned) {
				nextFound = true;
			} else {
				this.nvPointer++;
			}
		}
		return nextFound ? makeJust(this.variables[this.nvPointer].toInt()) : makeNothing();
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
