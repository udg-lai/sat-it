import { SvelteSet } from 'svelte/reactivity';
import type { AssignmentEval, IClausePool } from '../interfaces/IClausePool.ts';
import Clause, { type ClauseEval, isSatClause, isUnSATClause } from './Clause.ts';
import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { Claim } from '../parsers/dimacs.ts';

class ClausePool implements IClausePool {
	private clauses: Clause[];

	constructor(clauses: Clause[] = []) {
		this.clauses = clauses;
	}

	static buildFrom(claims: Claim[], variables: VariablePool): ClausePool {
		Clause.resetUniqueIdGenerator();
		const clauses: Clause[] = claims.map((c) => Clause.buildFrom(c, variables));
		return new ClausePool(clauses);
	}

	eval(): AssignmentEval {
		let unsat = false;
		let nSatisfied = 0;
		let i = 0;
		let conflictClause: Clause | undefined = undefined;
		while (i < this.clauses.length && !unsat) {
			const clause: Clause = this.clauses[i];
			const clauseEval: ClauseEval = clause.eval();
			unsat = isUnSATClause(clauseEval);
			if (!unsat) {
				const sat = isSatClause(clauseEval);
				if (sat) nSatisfied++;
				i++;
			} else {
				conflictClause = clause;
			}
		}
		let state: AssignmentEval;
		if (unsat) {
			state = {
				type: 'UnSAT',
				conflictClause: conflictClause?.getId() as number
			};
		} else if (nSatisfied === i) {
			state = { type: 'SAT' };
		} else {
			state = { type: 'UNRESOLVED' };
		}
		return state;
	}

	addClause(clause: Clause): void {
		this.clauses.push(clause);
	}

	get(i: number): Clause {
		if (i < 0 || i >= this.clauses.length) {
			throw '[ERROR]: accessing out of range for consulting a clause in the CNF';
		} else {
			return this.clauses[i];
		}
	}

	getUnitClauses(): SvelteSet<number> {
		const S = new SvelteSet<number>();
		for (const c of this.getClauses()) {
			if (c.optimalCheckUnit()) S.add(c.getId());
		}
		return S;
	}

	getClauses(): Clause[] {
		return this.clauses;
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
		return this.clauses.length;
	}
}

export default ClausePool;
