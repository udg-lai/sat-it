import Literal from "./literal.svelte.ts";

export default class CNF{
  clauses: Literal[][];

  constructor(clauses:Literal[][]){
    this.clauses = clauses;
  }

  public getClauses(): Literal[][] { return this.clauses; }
  public getClause(i: number): Literal[] {
    if(i < 0 && this.clauses.length < i){
      throw "ERROR: unexpected asked clause";
    }
    else {
      return this.clauses[i];
    }
  }
  
  public addClause(clause:Literal[]): void {
    this.clauses.push(clause);
  }

  public evaluate(): CNFState {
    let satisfiable: CNFState = CNFState.SAT;
    for (const clause of this.clauses) {
      let clausSatisfied: boolean | null = false;
      for (const literal of clause) {
        if (literal.isDefined() && literal.evaluate()) {
          clausSatisfied = true;
          break;
        } 
        else if (!literal.isDefined()) {
          clausSatisfied = null;
        }
      }
      if (clausSatisfied === false) {
        satisfiable = CNFState.UNSAT;
        break;
      } 
      else if (clausSatisfied === null && satisfiable === CNFState.SAT) {
        satisfiable = CNFState.UNDETERMINED;
      }
    }
  
    return satisfiable;
  }
}

export enum CNFState {
  UNSAT = "UNSAT",
  SAT = "SAT",
  UNDETERMINED = "UNDETERMINED"
}