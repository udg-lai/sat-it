import { logFatal, logWarning } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { SvelteMap } from 'svelte/reactivity';
import type Clause from './Clause.svelte.ts';
import type Literal from './Literal.svelte.ts';

export interface Watch {
	cRef: CRef;
	blocker: Literal | undefined; // For now we don't use blocker optimization
}

export default class WatchTable {
	private table: SvelteMap<Lit, Watch[]> = new SvelteMap();

	constructor(clauses: Clause[] = []) {
		this.syncWithClauses(clauses);
	}

	syncWithClauses(clauses: Clause[]): void {
		this.table.clear();
		this.makeWatchTable(clauses);
	}

	deleteWatch(lit: Lit, watch: Watch): void {
		if (!this.table.has(lit)) {
			logFatal('Deleting watch', `Literal ${lit} not found in watch table when deleting watch`);
		}
		// This process is expensive, I can improve it later (for now it's very declarative)
		const ws: Watch[] = this.table.get(lit)?.filter((w) => w.cRef !== watch.cRef) ?? [];
		this.table.set(lit, ws);
	}

	deleteWatches(clause: Clause): void {
		if (clause.isTemporal()) {
			logWarning('Delete watches', 'Skipping temporal clause when deleting watches');
		} else if (clause.size() < 2) {
			logWarning('Delete watches', 'Skipping unit or empty clause when deleting watches');
		} else {
			const literals: Literal[] = clause.getLiterals();
			const cRef = clause.getCRef();

			// Iterate over the two first positions where the watches are ensured to be
			for (let i = 0; i < 2; i++) {
				const literal: Literal = literals[i];
				const lit: number = literal.toInt();
				if (!this.table.has(lit)) {
					logFatal(
						'Deleting watches',
						`Literal ${lit} not found in watch table when deleting watches for clause ${cRef}`
					);
				}
				this.deleteWatch(lit, { cRef: cRef, blocker: undefined });
			}
		}
	}

	addWatch(lit: Lit, watch: Watch): void {
		if (!this.table.has(lit)) {
			this.table.set(lit, []);
		}
		const watches: Watch[] = this.table.get(lit) as Watch[];
		
		let low = 0;
		let high = watches.length;

		while (low < high) {
			const mid = (low + high) >>> 1;
			if (watches[mid].cRef < watch.cRef) {
				low = mid + 1;
			} else {
				high = mid;
			}
    	}
		
		watches.splice(low, 0, watch);
	}

	retrieveWatchesFromLiteral(lit: Lit): Watch[] {
		const watches: Watch[] | undefined = this.table.get(lit);
		if (!watches) {
			return [];
		} else {
			return watches;
		}
	}

	private makeWatchTable(clauses: Clause[]): void {
		// The clause allocator (i.e., ClausePool) must have already assigned tags to all clauses
		for (const clause of clauses) {
			// Skip temporal clauses
			if (clause.isTemporal()) continue;
			// The 2-watch scheme makes no sense for unit clauses and EMPTY CLAUSES
			if (clause.size() < 2) continue;

			this.addWatches(clause);
		}
	}

	addWatches(clause: Clause): void {
		// The invariant is that the watches appears on the very first two literals of the clause
		if (clause.isTemporal()) {
			logWarning('Add watches', 'Skipping temporal clause when adding watches');
		} else if (clause.size() < 2) {
			logWarning('Add watches', 'Skipping unit or empty clause when adding watches');
		} else {
			const literals: Literal[] = clause.getLiterals();
			const cRef = clause.getCRef();
			// Watch the first two literals in the clause
			for (let i = 0; i < 2; i++) {
				const literal: Literal = literals[i];
				const watch: Watch = {
					cRef: cRef,
					blocker: undefined
				};
				const lit: number = literal.toInt();
				if (!this.table.has(lit)) {
					this.table.set(lit, []);
				}
				this.table.get(lit)?.push(watch);
			}
		}
	}
}
