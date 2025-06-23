import logicResolution from '$lib/algorithms/resolution.ts';
import type Literal from './Literal.svelte.ts';

class TemporalClause {
	private literals: Literal[] = [];

	constructor(literals: Literal[] = []) {
		this.literals = literals;
	}

	getLiterals(): Literal[] {
		return [...this.literals];
	}

	resolution(other: TemporalClause): TemporalClause {
		return logicResolution(this, other);
	}

	containsVariable(variableId: number): boolean {
		const found = this.literals.find((lit) => {
			const id = lit.toInt();
			return Math.abs(id) === variableId;
		});
		return found !== undefined;
	}

	[Symbol.iterator]() {
		return this.literals.values();
	}

	map<T>(
		callback: (literal: Literal, index: number, array: Literal[]) => T,
		thisArg?: unknown
	): T[] {
		return this.literals.map(callback, thisArg);
	}
}
export default TemporalClause;
