import type DecisionVariable from '$lib/transversal/entities/DecisionLiteral.svelte.ts';

export class Trail {
	private trail: DecisionVariable[] = $state([]);
	private followUPIndex: number = $state(-1);
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;

	constructor(trailCapacity: number) {
		this.trailCapacity = trailCapacity;
	}

	public copy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.trail = this.trail.map((decision) => decision.copy());
		newTrail.followUPIndex = this.followUPIndex;
		return newTrail;
	}

	public getTrail(): DecisionVariable[] {
		return this.trail;
	}

	public push(decision: DecisionVariable) {
		if (this.trail.length == this.trailCapacity)
			console.warn('[WARN]: skipped allocating decision as trail capacity is fulfilled');
		else {
			this.trail.push(decision);
			if (decision.isD()) this.decisionLevel++;
		}
	}

	public pop(): DecisionVariable | undefined {
		const returnValue = this.trail.pop();
		if (returnValue?.isD()) this.decisionLevel--;
		return returnValue;
	}

	public indexOf(decision: DecisionVariable): number {
		return this.trail.indexOf(decision);
	}

	[Symbol.iterator]() {
		return this.trail.values();
	}

	forEach(
		callback: (decision: DecisionVariable, index: number, array: DecisionVariable[]) => void,
		thisArg?: unknown
	): void {
		this.trail.forEach(callback, thisArg);
	}

	public updateFollowUpIndex(): void {
		this.followUPIndex = this.trail.length - 1;
	}
}
