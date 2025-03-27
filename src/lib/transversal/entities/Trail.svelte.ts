import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private followUPIndex: number = $state(-1);
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;

	constructor(trailCapacity: number = 0) {
		this.trailCapacity = trailCapacity;
	}

	public copy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.followUPIndex = this.followUPIndex;
		return newTrail;
	}

	public getAssignments(): VariableAssignment[] {
		return this.assignments;
	}

	public push(assignment: VariableAssignment) {
		if (this.assignments.length == this.trailCapacity)
			console.warn('[WARN]: skipped allocating assignment as trail capacity is fulfilled');
		else {
			this.assignments.push(assignment);
			if (assignment.isD()) this.decisionLevel++;
		}
	}

	public pop(): VariableAssignment | undefined {
		const returnValue = this.assignments.pop();
		if (returnValue?.isD()) this.decisionLevel--;
		return returnValue;
	}

	public indexOf(assignment: VariableAssignment): number {
		return this.assignments.indexOf(assignment);
	}

	[Symbol.iterator]() {
		return this.assignments.values();
	}

	forEach(
		callback: (assignment: VariableAssignment, index: number, array: VariableAssignment[]) => void,
		thisArg?: unknown
	): void {
		this.assignments.forEach(callback, thisArg);
	}

	public updateFollowUpIndex(): void {
		this.followUPIndex = this.assignments.length - 1;
	}
}
