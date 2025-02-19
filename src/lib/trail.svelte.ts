import type DecisionVariable from "./decisionVariable.svelte.ts";

export class Trail {
    trail: DecisionVariable[] = $state([]);
    startingDL: number = 0;
    /*startingDL (Starting DecisionLevel): This variable has 2 purposes:
        1. To write the decisions of the trail with a brighter or shadier colour.
        2. When going back, to know if those decisions have been made at this level.
    */
    nVariables: number;

    constructor(nVariables: number, startingDL: number = 0) {
        this.nVariables = nVariables;
        this.startingDL = startingDL;
    }
    public getTrail():DecisionVariable[] { return this.trail; }
    public getStartingDL(): number { return this.startingDL; }

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
    //This function may not be needed in a future.
    public setStartignDL(): void {
        this.startingDL = 0;
        this.trail.forEach(decision => {
            if(decision.isD()) {
                this.startingDL++;
            }            
        });
    }

    [Symbol.iterator]() {
        return this.trail.values();
    }

    forEach(callback: (decision: DecisionVariable, index: number, array: DecisionVariable[]) => void, thisArg?: any): void {
    this.trail.forEach(callback, thisArg);
    }

}