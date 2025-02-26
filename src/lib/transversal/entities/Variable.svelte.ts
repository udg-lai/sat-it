export default class Variable {
  id: number;
  assignment: boolean = false;
  assigned: boolean = false;

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
    const newVariable = new Variable(this.id);
    newVariable.assign = this.assign;
    newVariable.assigned = this.assigned;
    return newVariable;
  }
}


export class IdVariableMap extends Map<number, Variable> {
  constructor() {
    super();
  }
}