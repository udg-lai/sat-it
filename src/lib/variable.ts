export class Variable {
  private id: number;
  private evaluation = false;
  private assigned = false;

  constructor(id: number) {
    this.id = id;
  }

  public getId() { return this.id; }
  public getEval() { return this.evaluation; }
  public isAssigned() { return this.assigned; }

  public assign(evaluation: boolean) {
    this.evaluation = evaluation;
    this.assigned = true;
  }
}
