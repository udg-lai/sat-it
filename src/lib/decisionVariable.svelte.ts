import type { Maybe } from "./utility.ts";
import type Variable from "./variable.svelte.ts";

export enum AssignmentReason {
  D = "decision",
  UP = "unit_propagation",
  K = "backtracking"
}


export default class DecisionVariable {
  decisionLevel: number;
  variable: Variable;
  assignment: boolean;
  reason: AssignmentReason;
  source: Maybe<string>;
  /* Source: This parametre will get the id of the clause that was the cause of the decision made:
    - If D: Undefined will be assigned as it is a simple decision
    - If UP: The source will be the id of the cluase that caused the propagation of the variable
    - If K: The sourece will be the id of the caluse that caused the conflict.
  */
  constructor(variable: Variable, decisionLevel:number,  assignment: boolean, reason: AssignmentReason, source: Maybe<string> = undefined) {
    this.variable = variable;
    this.decisionLevel = decisionLevel;
    this.assignment = assignment;
    this.reason = reason;
    this.source = source;
  }
  public copy(): DecisionVariable {
    return new DecisionVariable(this.variable,
      this.decisionLevel,
      this.assignment,
      this.reason,
      this.source);
  }


  public getDL(): number { return this.decisionLevel; }

  public getVariable(): Variable { return this.variable; }

  public getAssignemnt(): boolean { return this.assignment; }

  public getSource(): string {
    if (this.source === undefined) {
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

  public assign() {
    this.variable.assign(this.assignment);
  }

  public unassign(): void {
    this.variable.unassign();
  }

  public toTeX(): string {
    return [
      !this.assignment ? `\\neg` : "",
      this.variable.getId().toString()
    ].join("")
  }

}