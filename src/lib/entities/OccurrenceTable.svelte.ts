import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type Clause from './Clause.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

export default class OccurrenceTable {
	private table: SvelteMap<Lit, SvelteSet<CRef>> = new SvelteMap();

	constructor(clauses: Clause[] = []) {
		this.multipleAddOccurrences(clauses);
	}

	addOccurrences(clause: Clause): void {
		if (clause.getCRef() === undefined)
			logFatal('Adding occurrences', 'Clause must have a tag for occurrences to be added');
		const tag: CRef = clause.getCRef() as CRef;
		for (const literal of clause.getLiterals()) {
			const litId: Lit = literal.toInt();
			if (!this.table.has(litId)) {
				this.table.set(litId, new SvelteSet<CRef>());
			}
			this.table.get(litId)?.add(tag);
		}
	}

	multipleAddOccurrences(clauses: Clause[]): void {
		for (const clause of clauses) {
			this.addOccurrences(clause);
		}
	}

	removeOccurrences(clause: Clause): void {
		const tag: CRef = clause.getCRef() as CRef;
		for (const literal of clause.getLiterals()) {
			const litId: Lit = literal.toInt();
			this.table.get(litId)?.delete(tag);
			if (this.table.get(litId)?.size === 0) {
				logFatal(
					`ERROR: OccurrenceTable inconsistency detected`,
					`Literal ${litId} has no more occurrences after removing clause ${tag}.`
				);
			}
		}
	}

	multipleRemoveOccurrences(clauses: Clause[]): void {
		for (const clause of clauses) {
			this.removeOccurrences(clause);
		}
	}

	getTable(): SvelteMap<Lit, SvelteSet<CRef>> {
		return this.table;
	}
}
