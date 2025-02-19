import type DecisionVariable from "./decisionVariable.svelte.ts";

export class Trail {
    trail: DecisionVariable[] = $state([]);
    nVariables: number;

    constructor(nVariables: number) {
        this.nVariables = nVariables;
    }
    public getTrail():DecisionVariable[] { return this.trail; }

    public updateLimitOfVariables(nVariables: number): void {
        this.nVariables = nVariables;
    }

    public push(decision: DecisionVariable) {
        this.trail.push(decision);
    }

    public pop(): DecisionVariable | undefined {
        return this.trail.pop();
    }

    public complete(): boolean {
        return this.trail.length == this.nVariables;
    }

    public assign() {
        this.trail.forEach(decision => {
            decision.assign();
        })
    }

    [Symbol.iterator]() {
        return this.trail.values();
    }

    forEach(callback: (decision: DecisionVariable, index: number, array: DecisionVariable[]) => void, thisArg?: any): void {
    this.trail.forEach(callback, thisArg);
    }

}