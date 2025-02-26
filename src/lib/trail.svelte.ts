import type DecisionVariable from "./decisionVariable.svelte.ts";

export class Trail {
    private trail: DecisionVariable[] = $state([]);
    private followUPIndex: number = $state(0);
    private decisionLevel: number = 0;
    private trailCapacity: number = 0;

    constructor(nVariables: number) {
        this.trailCapacity = nVariables;
    }

    public copy(): Trail {
        return structuredClone(this);
    }

    public getTrail(): DecisionVariable[] { return this.trail; }

    public getFollowUpIndex(): number { return this.followUPIndex; }

    public indexOf(decision: DecisionVariable): number {
        return this.trail.indexOf(decision);
    }

    public push(decision: DecisionVariable, updateFollowUpIndex: boolean = false) {
        if (this.trail.length == this.trailCapacity)
            console.warn("[WARN]: skipped allocating decision as trail capacity is fulfilled")
        else {
            this.trail.push(decision);
            if (decision.isD()) this.decisionLevel++;
            if (updateFollowUpIndex) this.followUPIndex++;
        }
    }

    public pop(): DecisionVariable | undefined {
        const returnValue = this.trail.pop()
        if (returnValue?.isD()) this.decisionLevel--;
        return returnValue;
    }

    [Symbol.iterator]() {
        return this.trail.values();
    }

    forEach(callback: (decision: DecisionVariable, index: number, array: DecisionVariable[]) => void, thisArg?: any): void {
        this.trail.forEach(callback, thisArg);
    }
}