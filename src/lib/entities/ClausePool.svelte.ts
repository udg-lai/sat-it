import { logFatal } from '$lib/stores/toasts.ts';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	makeSat,
	makeUnresolved,
	makeUnSAT,
	type AssignmentEval,
} from '../interfaces/IClausePool.ts';
import type { Claim } from '../parsers/dimacs.ts';
import Clause, { type ClauseEval, isSatClause, isUnSATClause } from './Clause.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

export interface IClausePool {
	eval(): AssignmentEval;
	addClause(clause: Clause): void;
	get(clause: number): Clause;
	getUnitClauses(): SvelteSet<number>;
	getClauses(): Clause[];
	size(): number;
}

class ClausePool implements IClausePool {
	private clauses: SvelteMap<number, Clause> = new SvelteMap();
	private learnt: SvelteSet<number> = new SvelteSet();

	constructor(clauses: Clause[] = []) {
		this.clauses = new SvelteMap();
		this.learnt = new SvelteSet();
		for (const clause of clauses) {
			this._addClause(clause);
		}
	}

	static buildFrom(claims: Claim[], variables: VariablePool): ClausePool {
		const clauses: Clause[] = claims.map((c) => Clause.buildFrom(c, variables));
		return new ClausePool(clauses);
	}

	eval(): AssignmentEval {
		let unsat = false;
		let nSatisfied = 0;
		let i = 0;
		let conflict: Clause | undefined = undefined;
		const clauses: Clause[] = [...this.clauses.values()];
		while (i < clauses.length && !unsat) {
			const clause: Clause = clauses[i];
			const evaluation: ClauseEval = clause.eval();
			unsat = isUnSATClause(evaluation);
			if (!unsat) {
				const sat = isSatClause(evaluation);
				if (sat) nSatisfied++;
				i++;
			} else {
				conflict = clause;
			}
		}
		let state: AssignmentEval;
		if (unsat) {
			state = makeUnSAT(conflict?.getTag() as number);
		} else if (nSatisfied === i) {
			state = makeSat();
		} else {
			state = makeUnresolved();
		}
		return state;
	}

	addClause(clause: Clause): void {
		this._addClause(clause);
	}

	get(tag: number): Clause {
		return this._get(tag);
	}

	getUnitClauses(): SvelteSet<number> {
		const S = new SvelteSet<number>();
		for (const c of this.getClauses()) {
			if (c.isUnit()) S.add(c.getTag() as number);
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

	getLearnt(): Clause[] {
		return [...this.learnt.values()].map((tag) => this.clauses.get(tag) as Clause);
	}

	clearLearnt(): void {
		for (const tag of this.learnt) {
			this.clauses.delete(tag);
		}
		this.learnt.clear();
	}

	clear;

	private _addClause(clause: Clause): void {
		const id = this.clauses.size;
		clause.setTag(id);
		this.clauses.set(id, clause);
		if (clause.wasLearnt()) {
			this.learnt.add(id);
		}
	}

	private _get(tag: number): Clause {
		if (!this.clauses.has(tag)) {
			logFatal('ClausePool', `Accessing to an unknown clause by tag ${tag}`);
		} else {
			return this.clauses.get(tag) as Clause;
		}
	}
}

export default ClausePool;
