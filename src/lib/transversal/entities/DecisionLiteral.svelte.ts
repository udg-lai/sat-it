import { isNothing, makeNothing, unwrapMaybe, type Maybe } from "$lib/transversal/utils/types/maybe.ts";
import type Variable from "./Variable.svelte.ts";

export enum AssignmentReason {
  D = "decision",
  UP = "unit_propagation",
  K = "backtracking"
}

export default class DecisionLiteral {
  /**
   * Any instance of the decision literal is evaluated to true
   */
  variable: Variable;
  reason: AssignmentReason;
  clauseUpId: Maybe<number>;

  constructor(variable: Variable, reason: AssignmentReason, clauseUpId: Maybe<number> = makeNothing()) {
    this.variable = variable;
    this.reason = reason;
    this.clauseUpId = clauseUpId;
  }

  public copy(): DecisionLiteral {
    return new DecisionLiteral(this.variable,
      this.reason,
      this.clauseUpId);
  }

  public getVariable(): Variable { return this.variable; }

  public getSource(): number {
    if (isNothing(this.clauseUpId)) {
      throw "ERROR: There is no source for the decision";
    }
    return unwrapMaybe(this.clauseUpId);
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