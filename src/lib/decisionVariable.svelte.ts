import type { Maybe } from "./utility.ts";
import type Variable from "./variable.svelte.ts";

export enum AssignmentReason {
  D = "decision",
  UP = "unit_propagation",
  K = "backtracking"
}

export default class DecisionVariable {
  variable: Variable;
  reason: AssignmentReason;
  clauseUpId: Maybe<string>;

  constructor(variable: Variable, reason: AssignmentReason, clauseUpId: Maybe<string> = undefined) {
    this.variable = variable;
    this.reason = reason;
    this.clauseUpId = clauseUpId;
  }

  public copy(): DecisionVariable {
    return structuredClone(this)
  }

  public getVariable(): Variable { return this.variable; }

  public getSource(): string {
    if (this.clauseUpId === undefined) {
      throw "ERROR: There is no source for the decision";
    }
    return this.clauseUpId;
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

  public unassign(): void {
    this.variable.unassign();
  }

  public toTeX(): string {
    return [
      !this.variable.getAssignment() ? `\\neg` : "",
      this.variable.getId().toString()
    ].join("")
  }

}