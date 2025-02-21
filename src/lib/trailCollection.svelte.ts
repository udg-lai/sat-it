import type DecisionVariable from "./decisionVariable.svelte.ts";
import { Trail } from "./trail.svelte.ts";

export class TrailCollection {
  private collection: Trail[] = $state([]);
  private nVariables: number;
  private currentDL: number = 0;

  constructor(nVariables: number) {
    this.nVariables = nVariables;
    this.collection.push(new Trail(this.nVariables));
  }

  get currentTrail(): Trail {
    return this.collection.at(-1) ?? new Trail(this.nVariables);
  }
  public getCurrentDL() { return this.currentDL; }
  public getCurrentTrailCopy(): Trail { 
    return this.currentTrail.copy()
  } 
  
  public push(trail:Trail): void {
    this.collection.push(trail);
  }

  public pop (): Trail | undefined {
    return this.collection.pop();
  }

  public pushDecision(decision:DecisionVariable): void {
    this.currentTrail.push(decision);
  }

  public popDecision(): DecisionVariable | undefined {
    return this.currentTrail.pop()
  }

  public pushTrail(newTrail: Trail): void {
    this.collection.push(newTrail);
  }

  public popTrail(): Trail | undefined {
    return this.collection.pop();
  }

  public complete(): boolean {
    return this.currentTrail.complete();
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