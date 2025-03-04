import { makeJust, makeNothing, type Maybe } from '../utils/types/maybe.ts';
import Variable from './Variable.svelte.ts';

export default class VariablePool {
	private collection: Variable[];
	private currentVariable: number = 0;

	constructor(nVariables: number) {
		this.collection = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
	}

	public nextVariableToAssign(): Maybe<number> {
		while (this.currentVariable < this.collection.length) {
			if (!this.collection[this.currentVariable].isAssigned()) {
				return makeJust(this.collection[this.currentVariable++].getId());
			} else {
				this.currentVariable++;
			}
		}
		return makeNothing();
	}

	public getVariableState(index: number): boolean {
		if (index < 1 || this.collection.length < index)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			return this.collection[index - 1].getAssignment();
		}
	}

	public assignVariable(index: number, evaluation: boolean): void {
		if (index < 1 || this.collection.length < index)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			this.collection[index - 1].assign(evaluation);
		}
	}

	public unassignVariable(index: number) {
		if (index < 1 || this.collection.length < index)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			this.collection[index - 1].unassign();
			//Code to update the index:
			if (index - 1 < this.currentVariable) {
				this.currentVariable = index - 1;
			}
		}
	}
}
