import type Clause from './Clause.ts';
import { ClauseEval } from './Clause.ts';

export default class CNF {
	clauses: Clause[];

	constructor(clauses: Clause[]) {
		this.clauses = clauses;
	}

	public getClauses(): Clause[] {
		return this.clauses;
	}

	public getClause(i: number): Clause {
		if (i < 0 || i >= this.clauses.length) {
			throw '[ERROR]: accessing out of range for consulting a clause in the CNF';
		} else {
			return this.clauses[i];
		}
	}

	public addClause(clause: Clause): void {
		this.clauses.push(clause);
	}

	public eval(): Eval {
		// info: searches for un unsat clause to determine if
		// the CNF is UNSAT, otherwise it takes into account how
		// many clause have been satisfied to know if it is SAT or UNDETERMINED
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

	public getUnitClauses(): Set<Clause> {
		const S = new Set<Clause>();
		for (const c of this.getClauses()) {
			if (c.isUnit()) S.add(c);
		}
		return S;
	}
}

export enum Eval {
	UNSAT,
	SAT,
	UNRESOLVED
}
