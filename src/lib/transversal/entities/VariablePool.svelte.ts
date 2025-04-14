import type { IVariablePool } from '../utils/interfaces/IVariablePool.ts';
import { logError } from '../utils/logging.ts';
import { makeJust, makeNothing, type Maybe } from '../utils/types/maybe.ts';
import Variable from './Variable.svelte.ts';

class VariablePool implements IVariablePool {
	variables: Variable[] = $state([]);
	poolCapacity: number = 0;
	pointer: number = $state(0);
	nextVariable: number | undefined = $derived(this.variables.at(this.pointer)?.getInt());

	constructor(nVariables: number) {
		this.variables = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
		this.poolCapacity = nVariables;
		this.pointer = 0;
	}

	nextVariableToAssign(): Maybe<number> {
		return this.getNextId();
	}

	allAssigned(): boolean {
		// Edit: Now the pointer is always looking at the variable that is going to be assigned
		return this.pointer === this.poolCapacity;
	}

	dispose(variable: number): void {
		const variableIdx = this.checkIndex(variable);
		this.unassignVariable(variable);
		this.updatePointer(variableIdx);
	}

	persist(variable: number, assignment: boolean): void {
		const variableIdx = this.checkIndex(variable);
		this.checkAssignment(variableIdx);
		// updates the pointer if the user just selected the
		// next variable to assign
		if (this.pointer === variableIdx) this.pointer++;
		this.assignVariable(variable, assignment);
	}

	get(variable: number): Variable {
		const idx = this.checkIndex(variable);
		return this.variables[idx];
	}

	getCopy(variable: number): Variable {
		return this.get(variable).copy();
	}

	nVariables(): number {
		return this.poolCapacity;
	}

	assignedVariables(): number[] {
		return this.variables.filter((v) => v.isAssigned()).map((v) => v.getInt());
	}

	private updatePointer(disposedPosition: number) {
		this.pointer = Math.min(disposedPosition, this.pointer);
	}

	private getNextId(): Maybe<number> {
		let nextFound = false;
		while (this.pointer < this.poolCapacity && !nextFound) {
			const assigned = this.variables[this.pointer].isAssigned();
			if (!assigned) {
				nextFound = true;
			} else {
				this.pointer++;
			}
		}
		return nextFound ? makeJust(this.variables[this.pointer].getInt()) : makeNothing();
	}

	public assignVariable(id: number, evaluation: boolean): void {
		const idx = this.checkIndex(id);
		this.variables[idx].assign(evaluation);
	}

	public unassignVariable(id: number) {
		const idx = this.checkIndex(id);
		this.variables[idx].unassign();
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

	public getVariablesIDs(): number[] {
		return this.variables.map((variable) => variable.getInt());
	}
}

export default VariablePool;
