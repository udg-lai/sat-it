import Literal from "./literal.svelte.ts";

export default class CNF{
  clauses: Literal[][];

  constructor(clauses:Literal[][]){
    this.clauses = clauses;
  }

  public getClauses(): Literal[][] { return this.clauses; }
  public getClause(i: number): Literal[] {
    if(i < 0 || i >= this.clauses.length){
      throw "[ERROR]: accessing out of range for consulting a clause in the CNF";
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
    let clauseIndex = 0;
    
    while (clauseIndex < this.clauses.length && (satisfiable === CNFState.SAT || satisfiable === CNFState.UNDETERMINED)) {
      const clause = this.clauses[clauseIndex];
      let clausSatisfied: boolean | null = false;
      let literalIndex = 0;
      
      while (literalIndex < clause.length && (clausSatisfied === false || clausSatisfied === null)) {
        const literal = clause[literalIndex];

        if (literal.isDefined() && literal.evaluate()) {
          clausSatisfied = true;
        } 
        else if (!literal.isDefined()) {
          clausSatisfied = null;
        }
        literalIndex++;
      }

      if (clausSatisfied === false) {
        satisfiable = CNFState.UNSAT;
      } 
      else if (clausSatisfied === null && satisfiable === CNFState.SAT) {
        satisfiable = CNFState.UNDETERMINED;
      }
      
      clauseIndex++;
    }
  
    return satisfiable;
  }
}

export enum CNFState {
  UNSAT = "UNSAT",
  SAT = "SAT",
  UNDETERMINED = "UNDETERMINED"
}