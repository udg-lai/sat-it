import type Variable from "./variable.svelte.ts";

export enum AssignmentReason {
  D = "decision",
  UP = "unit_propagation",
  K = "backtracking"
}

export default class DecsionVariable {
  vairable: Variable;
  assignment: boolean;
  reason: AssignmentReason;
  source: string;
  /* Source: This parametre will get the id of the clause that was the cause of the decision made:
    - If D: An empty string will be assigned as it is a simple decision
    - If UP: The source will be the id of the cluase that caused the propagation of the variable
    - If K: The sourece will be the id of the caluse that caused the conflict.
  */
  constructor(variable:Variable, assignment:boolean, reason:AssignmentReason,  sourece: string = "") {
    this.vairable = variable;
    this.assignment = assignment;
    this.reason = reason;
    this.source = sourece;
  }
  public getVariable(): Variable { return this.vairable; }
  public getAssignemnt(): boolean { return this.assignment;}
  public getReason(): AssignmentReason { return this.reason; }
  public getSource(): string { 
    if (this.source === "") {
      throw "ERROR: There is no source for the decision";
    } 
    return this.source;
  }
  public assign() {
    this.vairable.assign(this.assignment);
  }
  
}