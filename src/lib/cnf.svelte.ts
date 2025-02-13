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

  public eval(): Eval {
    let state: Eval = Eval.UNDETERMINED
    let i = 0;
    let unsatCount = 0;
    while (i < this.literals.length && state !== Eval.SAT) {
      const lit: Literal = this.literals[i];
      if (lit.isTrue()) state = Eval.SAT
      else {
        if (lit.isFalse())
          unsatCount++;
        i++;
      }
    }
    if (state !== Eval.SAT) {
      state = unsatCount == i ? Eval.UNSAT : Eval.UNDETERMINED
    }
    return state;
  }

  public isUndetermined(): boolean {
    return this.eval() === Eval.UNDETERMINED;
  }

  public isSAT(): boolean {
    return this.eval() === Eval.SAT
  }

  public isUnSAT(): boolean {
    return this.eval() === Eval.UNSAT;
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
      let clauseEval: Eval = clause.eval()
      unsat = clauseEval === Eval.UNSAT;
      if (!unsat) {
        let sat = clauseEval === Eval.SAT;
        if (sat) nSatisfied++;
        i++;
      }
    }
    const state: Eval =
      unsat
        ? Eval.UNSAT
        : nSatisfied == i
        ? Eval.SAT
        : Eval.UNDETERMINED;
    return state;
  }
}

export enum Eval {
  UNSAT = "UNSAT",
  SAT = "SAT",
  UNDETERMINED = "UNDETERMINED"
}
