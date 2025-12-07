import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteMap } from 'svelte/reactivity';
import type Clause from './Clause.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type Literal from './Literal.svelte.ts';

export interface Watch {
	cRef: CRef;
	blocker: Literal; // The literal that is currently satisfying the clause
}

export default class WatchTable {
	private table: SvelteMap<Lit, Watch[]> = new SvelteMap();

	constructor(clauses: Clause[] = []) {
		this.table = this.makeWatchTable(clauses);
	}

	syncWithClauses(clauses: Clause[]): void {
		this.table = this.makeWatchTable(clauses);
	}

	deleteWatch(lit: Lit, watch: Watch): void {
		if (!this.table.has(lit)) {
			logFatal(
				'Deleting watch',
				`Literal ${lit.toString()} not found in watch table when deleting watch`
			);
		}
		// This process is expensive, I can improve it later (for now it's very declarative)
		const ws: Watch[] = this.table.get(lit)?.filter((w) => w.cRef !== watch.cRef) ?? [];
		this.table.set(lit, ws);
	}

	addWatch(lit: Lit, watch: Watch): void {
		if (!this.table.has(lit)) {
			this.table.set(lit, []);
		}
		this.table.get(lit)?.push(watch);
	}

	private makeWatchTable(clauses: Clause[]): SvelteMap<Lit, Watch[]> {
		const table: SvelteMap<Lit, Watch[]> = new SvelteMap();

		// The clause allocator (i.e., ClausePool) must have already assigned tags to all clauses
		for (const clause of clauses) {
			// The 2-watch scheme makes no sense for unit clauses
			if (clause.size() === 1) continue;

			// Otherwise, get the first two literals to watch
			const literals: Literal[] = clause.getLiterals();

			const cRef = clause.getCRef();
			if (cRef === undefined)
				logFatal('Making watch table', 'Clause without tag found when making watch table');

			// Watch the first two literals in the clause
			for (let i = 0; i < 2; i++) {
				const literal: Literal = literals[i];
				const watch: Watch = {
					cRef: cRef,
					blocker: literal
				};
				const litId: number = literal.toInt();
				if (!this.table.has(litId)) {
					this.table.set(litId, []);
				}
				this.table.get(litId)?.push(watch);
			}
		}
		return table;
	}
}
