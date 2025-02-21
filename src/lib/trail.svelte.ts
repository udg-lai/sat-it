import type DecisionVariable from "./decisionVariable.svelte.ts";

export class Trail {
    private trail: DecisionVariable[] = $state([]);
    private startingWP: number = $state(0);
    /*startingWP (Starting WritePoint): This variable has the following purpose:
        1. To write the decisions of the trail with a brighter or shadier colour.
        2. When going back, to know if those decisions have been made in this trail.
    */
    nVariables: number;

    constructor(nVariables: number) {
        this.nVariables = nVariables;
    }

    public copy() {
        const copy = new Trail(this.nVariables);
        copy.trail = this.trail.map(decision => decision.clone());
        copy.startingWP = this.startingWP;
        return copy;
    }

    public setStartignWP(): void {
        this.startingWP = this.trail.length-1;
    }

    public getTrail():DecisionVariable[] { return this.trail; }
    public getStartingWP(): number { return this.startingWP; }

    public indexOf(decision :DecisionVariable): number {
        return this.trail.indexOf(decision);
    }

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

    public assign(): void {
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