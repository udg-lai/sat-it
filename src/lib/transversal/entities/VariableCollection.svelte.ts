import { makeJust, makeNothing, type Maybe } from "../utils/types/maybe.ts";
import Variable from "./Variable.svelte.ts";

export default class VariableCollection {
  private collection: Variable[];
  private currentVariable: number = 0;

  constructor(nVariables: number) {
    this.collection = new Array(nVariables).fill(null).map((_, index) => new Variable(index));
  }

  public getcurrentVariable(): Maybe<Variable> {
    let index: number = this.currentVariable;
    while (this.currentVariable < this.collection.length) {
      if (this.collection[index].isAssigned()) {
        return makeJust(this.collection[index]);
      }
      else {
        index = this.currentVariable++;
      }
    }
    return makeNothing();
  }

  public getVariable(index: number): Variable {
    if (index < 1 || this.collection.length < index)
      throw "[ERROR]: Trying to obtain an out-of-range variable from the table"
    else {
      return this.collection[index - 1];
    }
  }

  public restartCounter(): void { this.currentVariable = 0; }
}