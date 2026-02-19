import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	makeSat,
	makeUnresolved,
	makeUnSAT,
	type AssignmentEval
} from '../interfaces/IClausePool.ts';
import type { Claim } from '../parsers/dimacs.ts';
import Clause, { isSatisfiedEval, isUnsatisfiedEval, type ClauseEval } from './Clause.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';
import type { CRef } from '$lib/types/types.ts';

export interface IClausePool {
	eval(): AssignmentEval;
	addClause(clause: Clause): CRef;
	at(clause: CRef): Clause;
	getClauses(p?: (clause: Clause) => boolean): Clause[];
	getLearnedClauses(): Clause[];
	size(): number;
}

class ClausePool implements IClausePool {
	private clauses: SvelteMap<CRef, Clause> = new SvelteMap();
	private learnedClauses: SvelteSet<CRef> = new SvelteSet();

	constructor(clauses: Clause[] = []) {
		this.clauses = new SvelteMap();
		this.learnedClauses = new SvelteSet();
		for (const clause of clauses) {
			this._addClause(clause);
		}
	}

	static buildFrom(claims: Claim[], variables: VariablePool): ClausePool {
		const clauses: Clause[] = claims.map((c) => Clause.buildFrom(c, variables));
		return new ClausePool(clauses);
	}

	eval(): AssignmentEval {
		let nSatisfied = 0;
		let i = 0;
		let conflict: Clause | undefined = undefined;
		const clauses: Clause[] = [...this.clauses.values()];
		while (i < clauses.length && conflict === undefined) {
			const clause: Clause = clauses[i];
			const evaluation: ClauseEval = clause.eval();
			const unSAT = isUnsatisfiedEval(evaluation);
			if (unSAT) {
				conflict = clause;
			} else {
				const sat = isSatisfiedEval(evaluation);
				if (sat) nSatisfied++;
				i++;
			}
		}
		let state: AssignmentEval;
		if (conflict !== undefined) {
			state = makeUnSAT(conflict.getCRef());
		} else if (nSatisfied === i) {
			state = makeSat();
		} else {
			state = makeUnresolved();
		}
		return state;
	}

	addClause(clause: Clause): CRef {
		return this._addClause(clause);
	}

	at(cRef: CRef): Clause {
		return this._at(cRef);
	}

	getSingleLiteralClauses(): SvelteSet<number> {
		const S = new SvelteSet<number>();
		for (const c of this.getClauses()) {
			if (c.size() === 1) S.add(c.getCRef());
		}
		return S;
	}

	getClauses(p?: (clause: Clause) => boolean): Clause[] {
		return p ? [...this.clauses.values()].filter(p) : [...this.clauses.values()];
	}

	size(): number {
		return this.clauses.size;
	}

	getLearnedClauses(): Clause[] {
		const learned: Clause[] = [];
		for (const cRef of this.learnedClauses) {
			if (!this.clauses.has(cRef)) {
				logFatal('ClausePool', `Learned clause with cRef ${cRef} not found in clauses map`);
			}
			learned.push(this.clauses.get(cRef) as Clause);
		}
		return learned;
	}

	wipeLearnedClauses(): void {
		// This functions removes all learned clauses from the pool
		// and returns the removed clauses
		this.learnedClauses.clear();
	}

	private _addClause(clause: Clause): CRef {
		// The clause pool allocator provides a new CRef to the clause
		const cRef: CRef = this.size();
		clause.setCRef(cRef);
		this.clauses.set(cRef, clause);
		// Quick access to the learned clauses
		if (clause.isLemma()) {
			this.learnedClauses.add(cRef);
		}
		return cRef;
	}

	private _at(cRef: CRef): Clause {
		if (!this.clauses.has(cRef)) {
			logFatal('ClausePool', `Accessing to an unknown clause by cRef ${cRef}`);
		} else {
			return this.clauses.get(cRef) as Clause;
		}
	}
}

export default ClausePool;
