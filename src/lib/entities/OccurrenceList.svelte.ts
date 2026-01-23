import { logError } from '$lib/states/toasts.svelte.ts';
import { makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { List, Lit } from '$lib/types/types.ts';

// Kinda static structure that holds the occurrences of clauses for a given literal.
// The occurrence list not necessary is provided by the assignment of a literal,
// but because of the initial unit propagations
// (i.e., no assignment triggered the visiting of the occurrences' complementary assignment)

export default class OccurrenceList<T> {
	private literal: Maybe<Lit> = $state(makeNothing());
	private cRefs: List<T>;
	private pointer: number = $state(-1);

	constructor(literal: Maybe<Lit> = makeNothing(), cRefs: List<T> = []) {
		this.literal = literal;
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

	getLiteral(): Maybe<Lit> {
		return this.literal;
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

	traversed(): boolean {
		return this.pointer >= this.cRefs.length - 1;
	}

	pointedCRef(): T {
		if (this.pointer < 0 || this.pointer >= this.cRefs.length) {
			logError('Pointer is out of bounds in occurrence list.');
		}
		return this.cRefs[this.pointer];
	}

	copy(): OccurrenceList<T> {
		const copiedLiteral: Maybe<Lit> = this.literal;
		const copiedClauses: List<T> = [...this.cRefs];
		const newOccurrenceList = new OccurrenceList(copiedLiteral, copiedClauses);
		newOccurrenceList.pointer = this.pointer;
		return newOccurrenceList;
	}
}
