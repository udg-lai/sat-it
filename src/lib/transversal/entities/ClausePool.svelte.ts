import type { Eval, IClausePool } from '../interfaces/IClausePool.ts';
import type { CNF } from '../mapping/contentToSummary.ts';
import { cnfToClauseSet } from '../utils.ts';
import Clause, { type ClauseEval, isSatClause, isUnsatClause } from './Clause.ts';
import type VariablePool from './VariablePool.svelte.ts';

class ClausePool implements IClausePool {
	private collection: Clause[];

	constructor(clauses: Clause[] = []) {
		this.collection = clauses;
	}

	static buildFrom(cnf: CNF, variables: VariablePool): ClausePool {
		Clause.resetUniqueIdGenerator();
		const clauses: Clause[] = cnfToClauseSet(cnf, variables);
		return new ClausePool(clauses);
	}

	eval(): Eval {
		let unsat = false;
		let nSatisfied = 0;
		let i = 0;
		let conflicClause: Clause | undefined = undefined;
		while (i < this.collection.length && !unsat) {
			const clause: Clause = this.collection[i];
			const clauseEval: ClauseEval = clause.eval();
			console.log('This is the eval of the clause', clause);
			console.log(clauseEval);
			unsat = isUnsatClause(clauseEval);
			if (!unsat) {
				const sat = isSatClause(clauseEval);
				if (sat) nSatisfied++;
				i++;
			} else {
				conflicClause = clause;
			}
		}
		let state: Eval;
		if (unsat) {
			state = {
				type: 'UNSAT',
				conflictClause: conflicClause?.getId() as number
			};
		} else if (nSatisfied === i) {
			state = { type: 'SAT' };
		} else {
			state = { type: 'UNRESOLVED' };
		}
		return state;
	}

	addClause(clause: Clause): void {
		this.collection.push(clause);
	}

	get(i: number): Clause {
		if (i < 0 || i >= this.collection.length) {
			throw '[ERROR]: accessing out of range for consulting a clause in the CNF';
		} else {
			return this.collection[i];
		}
	}

	getUnitClauses(): Set<number> {
		const S = new Set<number>();
		for (const c of this.getClauses()) {
			if (c.optimalCheckUnit()) S.add(c.getId());
		}
		return S;
	}

	getClauses(): Clause[] {
		return this.collection;
	}

	size(): number {
		return this.collection.length;
	}
}

export default ClausePool;
