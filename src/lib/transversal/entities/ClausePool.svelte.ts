import type { IClausePool } from '../utils/interfaces/IClausePool.ts';
import { Eval } from '../utils/interfaces/IClausePool.ts';
import Clause from './Clause.ts';
import { ClauseEval } from './Clause.ts';

class ClausePool implements IClausePool {
	private collection: Clause[];

	constructor(clauses: Clause[] = []) {
		this.collection = clauses;
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

	/*Eventually, this function will be only called when be go back in a trail and we want to forget a clause 
	  so there is no need to update the remaining clauses ids, but maybe in a future the user will be able to
	  delete some other clauses so I will leave the "reassignment" of the caluses ids */
	
	removeClause(clauseIndex: number): void {
		this.collection = this.collection.filter((_,i) => i !== clauseIndex);
		for (let i = clauseIndex; i < this.collection.length; i++) {
			this.collection[i].setId(i);
		}
		Clause.setIdCounter(this.collection.length);
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

	poolCapacity() : number {
		return this.collection.length;
	}
}

export default ClausePool;
