import type { IClausePool } from '../utils/interfaces/IClausePool.ts';
import { Eval } from '../utils/interfaces/IClausePool.ts';
import type { CNF } from '../utils/parsers/dimacs.ts';
import { cnfToClauseSet } from '../utils/utils.ts';
import Clause, { ClauseEval } from './Clause.ts';
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
		while (i < this.collection.length && !unsat) {
			const clause: Clause = this.collection[i];
			const clauseEval: ClauseEval = clause.eval();
			unsat = clauseEval === ClauseEval.UNSAT;
			if (!unsat) {
				const sat = clauseEval === ClauseEval.SAT;
				if (sat) nSatisfied++;
				i++;
			}
		}
		const state: Eval = unsat ? Eval.UNSAT : nSatisfied == i ? Eval.SAT : Eval.UNRESOLVED;
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

	getUnitClauses(): Set<Clause> {
		const S = new Set<Clause>();
		for (const c of this.getClauses()) {
			if (c.isUnit()) S.add(c);
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
