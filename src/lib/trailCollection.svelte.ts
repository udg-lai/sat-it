import type DecisionVariable from "./decisionVariable.svelte.ts";
import { Trail } from "./trail.svelte.ts";

export class TrailCollection {
  private collection: Trail[] = $state([]);
  private nVariables: number;

  constructor(nVariables: number) {
    this.nVariables = nVariables;
    this.collection.push(new Trail(this.nVariables));
  }

  get currentTrail(): Trail {
    if (this.collection.length === 0)
      throw "ERROR: empty trail collection";
    else
      return this.collection[this.collection.length - 1];
  }

  public getCurrentTrail(): Trail {
    return this.currentTrail;
  }

  public push(trail: Trail): void {
    this.collection.push(trail);
  }

  public pop(): Trail | undefined {
    return this.collection.pop();
  }

  public pushDecision(decision: DecisionVariable): void {
    this.currentTrail.push(decision);
  }

  public popDecision(): DecisionVariable | undefined {
    return this.currentTrail.pop()
  }

  //Functions to acces those methodes from the current trail
  public setStartignWP_CT(): void {
    this.currentTrail.setStartignWP();
  }

  public assign_CT(): void {
    this.currentTrail.assign();
  }

  // Functions to make this class iterbale
  [Symbol.iterator]() {
    return this.collection.values();
  }

  forEach(callback: (traiul: Trail, index: number, array: Trail[]) => void, thisArg?: any): void {
    this.collection.forEach(callback, thisArg);
  }
}