import type { IVariablePool } from '../utils/interfaces/IVariablePool.ts';
import { makeJust, makeNothing, type Maybe } from '../utils/types/maybe.ts';
import Variable from './Variable.svelte.ts';

class VariablePool implements IVariablePool {
	private collection: Variable[];
	poolCapacity: number = 0;
	pointer: number = 0;

	constructor(nVariables: number) {
		this.collection = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
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
		return this.collection[idx];
	}

	getCopy(variable: number): Variable {
		return this.get(variable).copy();
	}

	nVariables(): number {
		return this.poolCapacity;
	}

	private updatePointer(disposedPosition: number) {
		this.pointer = Math.min(disposedPosition, this.pointer);
	}

	private getNextId(): Maybe<number> {
		let nextFound = false;
		while (this.pointer < this.poolCapacity && !nextFound) {
			const assigned = this.collection[this.pointer].isAssigned();
			if (!assigned) {
				nextFound = true;
			} else {
				this.pointer++;
			}
		}
		return nextFound ? makeJust(this.collection[this.pointer].getInt()) : makeNothing();
	}

	public getVariableState(id: number): Maybe<boolean> {
		const idx = this.checkIndex(id);
		return this.collection[idx].getAssignment();
	}

	public assignVariable(id: number, evaluation: boolean): void {
		const idx = this.checkIndex(id);
		this.collection[idx].assign(evaluation);
	}

	public unassignVariable(id: number) {
		const idx = this.checkIndex(id);
		this.collection[idx].unassign();
	}

	private checkAssignment(idx: number) {
		if (this.collection[idx].isAssigned()) {
			throw '[ERROR]: You can not reassign this variable in this trail';
		}
	}

	private checkIndex(variableId: number): number {
		const idx = this.variableToIndex(variableId);
		if (idx < 0 || idx >= this.collection.length)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		return idx;
	}

	private variableToIndex(variableId: number): number {
		return variableId - 1;
	}
}

export default VariablePool;
