import type Variable from "./variable.svelte.ts";

export enum AssignmentReason {
  D = "decision",
  UP = "unit_propagation",
  K = "backtracking"
}

export default class DecisionVariable {
  vairable: Variable;
  decisionLevel: number;
  assignment: boolean;
  reason: AssignmentReason;
  source: string;
  /* Source: This parametre will get the id of the clause that caused the conflict. 
             The value will be assigned deppending on the "resason" value:
    - If D:  An empty string will be assigned as it is a simple decision
    - If UP: The source will be the id of the cluase that caused the propagation of the variable.
    - If K:  The sourece will be the id of the caluse that caused the conflict.
  */
  constructor(variable:Variable, decisionLevel:number , assignment:boolean, reason:AssignmentReason,  sourece: string = "") {
    this.vairable = variable;
    this.decisionLevel = decisionLevel;
    this.assignment = assignment;
    this.reason = reason;
    this.source = sourece;
  }
  public getVariable(): Variable { return this.vairable; }
  public getDL(): number { return this.decisionLevel; }
  public getAssignemnt(): boolean { return this.assignment;}
  public getSource(): string { 
    if (this.source === "") {
      throw "ERROR: There is no source for the decision";
    } 
    return this.source;
  }

  public isD(): boolean {
    return this.reason === AssignmentReason.D;
  }

  public isUP(): boolean {
    return this.reason === AssignmentReason.UP;
  }

  public isK(): boolean {
    return this.reason === AssignmentReason.K;
  }

  public assign(): void {
    this.vairable.assign(this.assignment);
  }

  public unassign(): void {
    this.vairable.unassign();
  }

  public toTeX(): string {
    return[
      !this.assignment ? `\\neg` : "",
      this.vairable.getId().toString()
    ].join("")
  }
  
}