import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	makeSat,
	makeUnresolved,
	makeUnSAT,
	type AssignmentEval
} from '../interfaces/IClausePool.ts';
import type { Claim } from '../parsers/dimacs.ts';
import Clause, { isSatClause, isUnSATClause, type ClauseEval } from './Clause.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';
import type { CRef } from '$lib/types/types.ts';

export interface IClausePool {
	eval(): AssignmentEval;
	addClause(clause: Clause): CRef;
	get(clause: number): Clause;
	getUnitClauses(): Clause[];
	getClauses(): Clause[];
	size(): number;
}

class ClausePool implements IClausePool {
	private clauses: SvelteMap<number, Clause> = new SvelteMap();
	private learnedClauses: SvelteSet<number> = new SvelteSet();

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
			const unSAT = isUnSATClause(evaluation);
			if (!unSAT) {
				const sat = isSatClause(evaluation);
				if (sat) nSatisfied++;
				i++;
			} else {
				conflict = clause;
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

	get(tag: number): Clause {
		return this._get(tag);
	}

	getUnitClauses(): Clause[] {
		return this.getClauses().filter((c: Clause) => c.isUnit());
	}

	getSingleLiteralClauses(): SvelteSet<number> {
		const S = new SvelteSet<number>();
		for (const c of this.getClauses()) {
			if (c.size() === 1) S.add(c.getCRef());
		}
		return S;
	}

	getClauses(): Clause[] {
		return [...this.clauses.values()];
	}

	leftToSatisfy(): number {
		let leftToSatisfy: number = 0;
		this.clauses.forEach((clause) => {
			const evaluation: ClauseEval = clause.eval();
			if (!isSatClause(evaluation)) leftToSatisfy += 1;
		});
		return leftToSatisfy;
	}

	size(): number {
		return this.clauses.size;
	}

	getClausesLearned(): Clause[] {
		const learned: Clause[] = [];
		for (const cRef of this.learnedClauses) {
			if (!this.clauses.has(cRef)) {
				logFatal('ClausePool', `Learned clause with cRef ${cRef} not found in clauses map`);
			}
			learned.push(this.clauses.get(cRef) as Clause);
		}
		return learned;
	}

	pruneLearnedClauses(): Clause[] {
		// This functions removes all learned clauses from the pool
		// and returns the removed clauses
		const removedClauses: Clause[] = [];
		for (const tag of this.learnedClauses) {
			removedClauses.push(this.clauses.get(tag) as Clause);
			this.clauses.delete(tag);
		}
		this.learnedClauses.clear();
		return removedClauses;
	}

	private _addClause(clause: Clause): CRef {
		// The clause pool allocator provides a new CRef to the clause
		const cRef: CRef = this.size();
		clause.setCRef(cRef);
		this.clauses.set(cRef, clause);
		// Quick access to the learned clauses
		if (clause.hasBeenLearned()) {
			this.learnedClauses.add(cRef);
		}
		return cRef;
	}

	private _get(cRef: CRef): Clause {
		if (!this.clauses.has(cRef)) {
			logFatal('ClausePool', `Accessing to an unknown clause by cRef ${cRef}`);
		} else {
			return this.clauses.get(cRef) as Clause;
		}
	}
}

export default ClausePool;
