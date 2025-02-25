export default class Variable {
  id: number;
  evaluation = $state(false);
  assigned = $state(false);

  constructor(id: number) {
    if (id < 0) throw "ERROR: variable ID should be >= 0";
    this.id = id;
  }

  public getId(): number { return this.id; }
  public isAssigned(): boolean { return this.assigned; }

  public evaluate(): boolean {
    if (!this.isAssigned())
      throw "ERROR: variable not assigned yet";
    return this.evaluation;
  }

  public assign(evaluation: boolean): void {
    this.evaluation = evaluation;
    this.assigned = true;
  }

  public unassign(): void {
    this.assigned = false;
  }

  public negate(): void {
    this.evaluation != this.evaluation;
  }
}


export class IdVariableMap extends Map<number, Variable> {
  constructor() {
    super();
  }
}