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
  public get curre() { return this.currentDL; }
  
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

  
}