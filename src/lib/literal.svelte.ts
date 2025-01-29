import Variable from '$lib/variable.svelte.ts';
import { v4 as uuidv4 } from 'uuid';

export type Polarity = 'Positive' | 'Negative';

export default class Literal {
  id: string;
  variable: Variable;
  polarity: Polarity;

  constructor(variable: Variable, polarity: Polarity) {
    this.id = uuidv4();
    this.variable = variable;
    this.polarity = polarity;
  }

  public getId() { return this.id; }
  public getVariable() { return this.variable; }
  public getPolarity() { return this.polarity; }

  public isDefined(): boolean {
    return this.variable.isAssigned();
  }

  public evaluate(): boolean {
    let evaluation = this.variable.evaluate();
    if (this.polarity === 'Negative')
      evaluation = !evaluation;
    return evaluation;
  }

  public isTrue(): boolean {
    return this.isDefined() && this.evaluate();
  }

  public isFalse(): boolean {
    return this.isDefined() && !this.evaluate();
  }

  public toTeX(): string {
    return [
      this.polarity == 'Negative' ? `\\neg` : "",
      this.getVariable().getId().toString()
    ].join("")
  }
}
