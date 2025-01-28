import Variable from '$lib/variable.svelte.ts';
import { v4 as uuidv4 } from 'uuid';

export type Polarity = 'Positive' | 'Negative';

export default class Literal {
  private id: string;
  private variable:  Variable;
  private polarity: Polarity;

  constructor(variable: Variable, polarity: Polarity) {
    this.id = uuidv4();
    this.variable = variable;
    this.polarity = polarity;
  }

  public getId() { return this.id; }
  public getVariable() { return this.variable; }
  public getPolarity() { return this.polarity; }

  public evaluate(): boolean {
    let evaluation = this.variable.evaluate();
    if (this.polarity === 'Negative')
      evaluation = !evaluation;
    return evaluation;
  }
}
