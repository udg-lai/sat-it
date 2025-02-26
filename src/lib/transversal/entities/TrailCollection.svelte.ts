import { Trail } from "./Trail.svelte.ts";

export class TrailCollection {
  private collection: Trail[] = $state([]);

  constructor() { }

  public push(trail: Trail): void {
    this.collection.push(trail);
  }

  public isEmpty(): boolean {
    return this.collection.length == 0;
  }

  public pop(): Trail {
    if (this.isEmpty()) 
      throw "[ERROR]: pop and empty stack";
    else 
      return this.collection.pop() as Trail;
  }

  public last(): Trail {
    if (this.isEmpty())
      throw "[ERROR]: last to and empty stack";
    else {
      return this.collection[this.collection.length - 1];
    }
  }

  // Functions to make this class iterbale
  [Symbol.iterator]() {
    return this.collection.values();
  }

  forEach(callback: (trail: Trail, index: number, array: Trail[]) => void, thisArg?: any): void {
    this.collection.forEach(callback, thisArg);
  }
}