import Literal from "./literal.svelte.ts";
import { v4 as uuidv4 } from 'uuid';

export class Clause {
  literals: Literal[] = []
  id: string;

  constructor(literals: Literal[]) {
    this.id = uuidv4();
    this.literals = literals;
  }

  public addLiteral(lit: Literal) {
    this.literals.push(lit);
  }

  public removeLiteral(lit: Literal) {
    this.literals = this.literals.filter(l => l.id != lit.id);
  }

  public eval(): ClauseEval {
    let state = ClauseEval.UNRESOLVED
    let i = 0;
    let unsatCount = 0;
    while (i < this.literals.length && state !== ClauseEval.SAT) {
      const lit: Literal = this.literals[i];
      if (lit.isTrue())
        state = ClauseEval.SAT
      else {
        if (lit.isFalse())
          unsatCount++;
        i++;
      }
    }
    if (state !== ClauseEval.SAT) {
      state =
        unsatCount == i
          ? ClauseEval.UNSAT
          : unsatCount == i - 1
            ? ClauseEval.UNIT
            : ClauseEval.UNRESOLVED
    }
    return state;
  }

  public isUndetermined(): boolean {
    return this.eval() === ClauseEval.UNRESOLVED;
  }

  public isSAT(): boolean {
    return this.eval() === ClauseEval.SAT
  }

  public isUnSAT(): boolean {
    return this.eval() === ClauseEval.UNSAT;
  }

  public isUnit(): boolean {
    return this.eval() === ClauseEval.UNIT;
  }

  [Symbol.iterator]() {
    return this.literals.values();
  }

  forEach(callback: (literal: Literal, index: number, array: Literal[]) => void, thisArg?: any): void {
    this.literals.forEach(callback, thisArg);
  }
}

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
      throw "[ERROR]: accessing out of range for consulting a clause in the CNF";
    }
    else {
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
      let clauseEval: ClauseEval = clause.eval()
      unsat = clauseEval === ClauseEval.UNSAT;
      if (!unsat) {
        let sat = clauseEval === ClauseEval.SAT;
        if (sat)
          nSatisfied++;
        i++;
      }
    }
    const state: Eval =
      unsat
        ? Eval.UNSAT
        : nSatisfied == i
          ? Eval.SAT
          : Eval.UNRESOLVED;
    return state;
  }

  public getUnitClauses(): Set<Clause> {
    const S = new Set<Clause>()
    for (const c of this.getClauses()) {
      if (c.isUnit()) S.add(c)
    }
    return S;
  }
}

export enum Eval {
  UNSAT, SAT, UNRESOLVED
}

export enum ClauseEval {
  UNSAT, SAT, UNIT, UNRESOLVED
}