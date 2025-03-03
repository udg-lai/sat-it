import { makeJust, makeNothing, type Maybe } from '../utils/types/maybe.ts';
import Variable from './Variable.svelte.ts';

export default class VariableCollection {
	private collection: Variable[];
	private currentVariable: number = 0;

	constructor(nVariables: number) {
		this.collection = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
	}

	public getNextId(): Maybe<number> {
		while (this.currentVariable < this.collection.length) {
			if (!this.collection[this.currentVariable].isAssigned()) {
				return makeJust(this.collection[this.currentVariable++].getId());
			} else {
				this.currentVariable++;
			}
		}
		return makeNothing();
	}

	public getVariableState(id: number): boolean {
		const idx = this.toIndex(id);
		if (idx < 0 || idx >= this.collection.length)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			return this.collection[idx].getAssignment();
		}
	}

	public assignVariable(id: number, evaluation: boolean): void {
		const idx = this.toIndex(id);
		if (idx < 0 || idx >= this.collection.length)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			this.collection[idx].assign(evaluation);
		}
	}

	public unassignVariable(id: number) {
		const idx = this.toIndex(id);
		if (idx < 0 || idx >= this.collection.length)
			throw '[ERROR]: Trying to obtain an out-of-range variable from the table';
		else {
			this.collection[idx].unassign();
		}
	}

	public restartCounter(): void {
		this.currentVariable = 0;
	}

	private toIndex(id: number): number {
		return id - 1;
	}
}
