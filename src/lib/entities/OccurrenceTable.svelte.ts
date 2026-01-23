import { logFatal } from '$lib/states/toasts.svelte.ts';
import type Clause from './Clause.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

export default class OccurrenceTable {
	private table: Map<Lit, Set<CRef>> = new Map();

	constructor(clauses: Clause[] = []) {
		this.multipleAddOccurrences(clauses);
	}

	addOccurrences(clause: Clause): void {
		if (clause.isTemporal()) {
			logFatal(`Occurrence table`, `Cannot add occurrences for temporal clause without CRef.`);
		}
		const cRef: CRef = clause.getCRef();
		for (const literal of clause.getLiterals()) {
			const lit: Lit = literal.toInt();
			if (!this.table.has(lit)) {
				this.table.set(lit, new Set<CRef>());
			}
			this.table.get(lit)?.add(cRef);
		}
	}

	multipleAddOccurrences(clauses: Clause[]): void {
		for (const clause of clauses) {
			this.addOccurrences(clause);
		}
	}

	removeOccurrences(clause: Clause): void {
		const cRef: CRef = clause.getCRef();
		for (const literal of clause.getLiterals()) {
			const lit: Lit = literal.toInt();
			this.table.get(lit)?.delete(cRef);
			if (this.table.get(lit)?.size === 0) {
				logFatal(
					`Occurrence table`,
					`Literal ${lit} has no more occurrences after removing clause ${cRef}.`
				);
			}
		}
	}

	getTable(): Map<Lit, Set<CRef>> {
		return this.table;
	}
}
