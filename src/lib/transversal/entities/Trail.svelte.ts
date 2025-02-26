import type DecisionLiteral from "$lib/transversal/entities/DecisionLiteral.svelte.ts";

export class Trail {
    private trail: DecisionLiteral[] = $state([]);
    private followUPIndex: number = $state(0);
    private decisionLevel: number = 0;
    private trailCapacity: number = 0;

    constructor(trailCapacity: number) {
        this.trailCapacity = trailCapacity;
    }

    public copy(): Trail {
        const newTrail = new Trail(this.trailCapacity);
        newTrail.trail = this.trail.map(decision => decision.copy());
        newTrail.followUPIndex = this.followUPIndex;
        return newTrail;
    }

    public getTrail(): DecisionLiteral[] { return this.trail; }

    public getFollowUpIndex(): number { return this.followUPIndex; }

    public updateFollowUpIndex(): void {
        this.followUPIndex = this.trail.length - 1;
    }

    public push(decision: DecisionLiteral, updateFollowUpIndex: boolean = false) {
        if (this.trail.length == this.trailCapacity)
            console.warn("[WARN]: skipped allocating decision as trail capacity is fulfilled")
        else {
            this.trail.push(decision);
            if (decision.isD()) this.decisionLevel++;
            if (updateFollowUpIndex) this.updateFollowUpIndex();
        }
    }


    public pop(): DecisionLiteral | undefined {
        const returnValue = this.trail.pop()
        if (returnValue?.isD()) this.decisionLevel--;
        return returnValue;
    }

    public indexOf(decision: DecisionLiteral): number {
        return this.trail.indexOf(decision);
    }

    [Symbol.iterator]() {
        return this.trail.values();
    }

    forEach(callback: (decision: DecisionLiteral, index: number, array: DecisionLiteral[]) => void, thisArg?: any): void {
        this.trail.forEach(callback, thisArg);
    }
}