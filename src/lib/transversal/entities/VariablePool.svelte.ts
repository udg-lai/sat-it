import type { IVariablePool } from '../interfaces/IVariablePool.ts';
import { logError } from '../logging.ts';
import { makeJust, makeNothing, type Maybe } from '../types/maybe.ts';
import Variable from './Variable.svelte.ts';

class VariablePool implements IVariablePool {
	variables: Variable[] = $state([]);
	capacity: number = 0;
	pointer: number = $state(0);
	nextVariable: number | undefined = $derived(this.variables.at(this.pointer)?.getInt());

	constructor(nVariables: number) {
		this.variables = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
		this.capacity = nVariables;
		this.pointer = 0;
	}

	reset(): void {
		this.variables.forEach((variable) => {
			variable.unassign();
		});
		this.pointer = 0;
	}

	nextVariableToAssign(): Maybe<number> {
		return this.getNextId();
	}

	allAssigned(): boolean {
		// Edit: Now the pointer is always looking at the variable that is going to be assigned
		return this.pointer === this.capacity;
	}

	dispose(variable: number): void {
		const varIndex = this.checkIndex(variable);
		this.unassignVariable(variable);
		this.updatePointer(varIndex, 'dispose');
	}

	persist(variable: number, assignment: boolean): void {
		const varIndex = this.checkIndex(variable);
		this.checkAssignment(varIndex);
		this.assignVariable(variable, assignment);
		this.updatePointer(varIndex, 'persist');
	}

	get(variable: number): Variable {
		const idx = this.checkIndex(variable);
		return this.variables[idx];
	}

	getCopy(variable: number): Variable {
		return this.get(variable).copy();
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

	assignVariable(id: number, evaluation: boolean): void {
		const idx = this.checkIndex(id);
		this.variables[idx].assign(evaluation);
	}

	unassignVariable(id: number) {
		const idx = this.checkIndex(id);
		this.variables[idx].unassign();
	}

	getVariablesIDs(): number[] {
		return this.variables.map((variable) => variable.getInt());
	}

	private updatePointer(varIndex: number, kind: 'dispose' | 'persist') {
		if (kind === 'dispose') {
			this.pointer = Math.min(varIndex, this.pointer);
		} else {
			if (this.pointer === varIndex) {
				while (this.pointer < this.capacity && this.variables[this.pointer].isAssigned()) {
					this.pointer++;
				}
			}
		}
	}

	private getNextId(): Maybe<number> {
		let nextFound = false;
		while (this.pointer < this.capacity && !nextFound) {
			const assigned = this.variables[this.pointer].isAssigned();
			if (!assigned) {
				nextFound = true;
			} else {
				this.pointer++;
			}
		}
		return nextFound ? makeJust(this.variables[this.pointer].getInt()) : makeNothing();
	}

	private checkAssignment(idx: number) {
		if (this.variables[idx].isAssigned()) {
			logError(`Variable ${idx} is already assigned`);
		}
	}

	private checkIndex(variableId: number): number {
		const idx = this.variableToIndex(variableId);
		if (idx < 0 || idx >= this.variables.length)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		return idx;
	}

	private variableToIndex(variableId: number): number {
		return variableId - 1;
	}
}

export default VariablePool;
