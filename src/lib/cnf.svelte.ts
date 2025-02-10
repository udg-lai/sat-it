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

  public evaluate(): boolean {
    let satisfiable: boolean = true;
    for(const clause of this.clauses) {
      let clausSatisfied = false;
      for(const literal of clause) {
        if(literal.evaluate()) {
          clausSatisfied = true;
          break;
        }
      }
      if(!clausSatisfied) {
        satisfiable = false;
        break;
      }
    }
    return satisfiable;
  }
}