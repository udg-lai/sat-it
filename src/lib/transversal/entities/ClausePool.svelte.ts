import { Eval, type IClausePool } from '../interfaces/IClausePool.ts';
import type { CNF } from '../mapping/contentToSummary.ts';
import { cnfToClauseSet } from '../utils.ts';
import Clause, { ClauseEval } from './Clause.ts';
import type VariablePool from './VariablePool.svelte.ts';

class ClausePool implements IClausePool {
	private clauses: Clause[];

	constructor(clauses: Clause[] = []) {
		this.clauses = clauses;
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
		while (i < this.clauses.length && !unsat) {
			const clause: Clause = this.clauses[i];
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
		this.clauses.push(clause);
	}

	get(i: number): Clause {
		if (i < 0 || i >= this.clauses.length) {
			throw '[ERROR]: accessing out of range for consulting a clause in the CNF';
		} else {
			return this.clauses[i];
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
		return this.clauses;
	}

	size(): number {
		return this.clauses.length;
	}
}

export default ClausePool;
