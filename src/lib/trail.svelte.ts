import type DecisionVariable from "./decisionVariable.svelte.ts";

export class Trail {
    private trail: DecisionVariable[] = $state([]);
    private currentDL: number = 0;
    private followUPIndex: number = $state(0);
    /*startingWP (Starting WritePoint): This variable has the following purpose:
        1. To write the decisions of the trail with a brighter or shadier colour.
        2. When going back, to know if those decisions have been made in this trail.
    */
    nVariables: number;

    constructor(nVariables: number) {
        this.nVariables = nVariables;
    }

    public copy() {
        const newTrail = new Trail(this.nVariables);
        newTrail.trail = this.trail.map(decision => decision.copy());
        newTrail.followUPIndex = this.followUPIndex;
        return newTrail;
    }

    public setStartignWP(): void {
        this.followUPIndex = this.trail.length - 1;
    }

    public getTrail(): DecisionVariable[] { return this.trail; }

    public getFollowUpIndex(): number { return this.followUPIndex; }

    public indexOf(decision: DecisionVariable): number {
        return this.trail.indexOf(decision);
    }

    public updateLimitOfVariables(nVariables: number): void {
        this.nVariables = nVariables;
    }

    public push(decision: DecisionVariable) {
        this.trail.push(decision);
        if (decision.isD()) this.currentDL++;
    }

    public pop(): DecisionVariable | undefined {
        const returnValue = this.trail.pop()
        if (returnValue?.isD()) this.currentDL--;
        return returnValue;
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