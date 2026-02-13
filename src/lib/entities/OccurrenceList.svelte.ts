import { logError } from '$lib/states/toasts.svelte.ts';
import type { Either } from '$lib/types/either.ts';
import type { CRef, List, Lit } from '$lib/types/types.ts';
import type { Watch } from './WatchTable.svelte.ts';

// Kinda static structure that holds the occurrences of clauses for a given literal.
// The occurrence list not necessary is provided by the assignment of a literal,
// but because of the initial unit propagations
// (i.e., no assignment triggered the visiting of the occurrences' complementary assignment)

export default class ClauseList<T> {
	private cRefs: List<T>;
	private pointer: number = $state(-1);

	constructor(cRefs: List<T> = []) {
		this.cRefs = cRefs;
		this.pointer = -1;
	}

	next(): T {
		this.pointer += 1;
		if (this.pointer >= this.cRefs.length) {
			logError('No more clauses to visit in this occurrence list.');
		}
		return this.cRefs[this.pointer];
	}

	getOccurrences(): List<T> {
		return this.cRefs;
	}

	isEmpty(): boolean {
		return this.cRefs.length === 0;
	}

	at(index: number): T {
		if (index < 0 || index >= this.cRefs.length) {
			logError('Index out of bounds in occurrence list.');
		}
		return this.cRefs[index];
	}

	getPointer(): number {
		return this.pointer;
	}

	updatePointer(pointer: number): void {
		if (pointer < -1 || pointer >= this.cRefs.length) {
			logError('The pointer can take the value');
		}
		this.pointer = pointer;
	}

	traversed(): boolean {
		return this.pointer >= this.cRefs.length - 1;
	}

	pointedCRef(): T {
		if (this.pointer < 0 || this.pointer >= this.cRefs.length) {
			logError('Pointer is out of bounds in occurrence list.');
		}
		return this.cRefs[this.pointer];
	}

	copy(): ClauseList<T> {
		const copiedClauses: List<T> = [...this.cRefs];
		const newOccurrenceList = new ClauseList(copiedClauses);
		newOccurrenceList.updatePointer(this.pointer);
		return newOccurrenceList;
	}
}

export class ComplementaryList<T> extends ClauseList<T> {
	private literal: Lit;

	constructor(literal: Lit, cRefs: List<T> = []) {
		super(cRefs);
		this.literal = literal;
	}

	getLiteral(): Lit {
		return this.literal;
	}

	copy(): ComplementaryList<T> {
		const newOccurrenceList = new ComplementaryList(this.literal, [...this.getOccurrences()]);
		newOccurrenceList.updatePointer(this.getPointer());
		return newOccurrenceList;
	}
}
export type PreprocessingList = ClauseList<CRef>;
//export class PreprocessingList extends ClauseList<CRef> {
//
//}

export type OccurrenceList = ComplementaryList<CRef>;
//export class OccurrenceList extends ComplementaryList<CRef> {
//	constructor(literal: Lit, cRefs: List<CRef> = []) {
//		super(literal ,cRefs);
//	}
//}

export class WatchList extends ComplementaryList<Watch> {
	constructor(literal: Lit, cRefs: List<Watch> = []) {
		super(literal, cRefs);
	}
}

export type VisitingOccurrenceList = Either<PreprocessingList, OccurrenceList>;
export type VisitingWatchList = Either<PreprocessingList, WatchList>;
