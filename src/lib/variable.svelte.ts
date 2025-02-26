export default class Variable {
  id: number;
  assignment = $state(false);
  assigned = $state(false);

  constructor(id: number) {
    if (id < 0) throw "ERROR: variable ID should be >= 0";
    this.id = id;
  }

  public getId(): number { return this.id; }

  public isAssigned(): boolean { return this.assigned; }

  public getAssignment(): boolean {
    if (!this.isAssigned())
      throw "ERROR: variable not assigned yet";
    return this.assignment;
  }

  public assign(evaluation: boolean): void {
    this.assignment = evaluation;
    this.assigned = true;
  }

  public unassign(): void {
    this.assigned = false;
  }

  public negate(): void {
    this.assignment != this.assignment;
  }

  public copy(): Variable {
    return structuredClone(this);
  }
}


export class IdVariableMap extends Map<number, Variable> {
  constructor() {
    super();
  }
}