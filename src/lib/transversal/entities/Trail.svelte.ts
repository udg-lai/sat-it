import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';

interface IndexedDecision {
	bookMark: number,
	decision: VariableAssignment
}

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private decisionBookMark: number[] = $state([]);
	private followUPIndex: number = $state(-1);
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;

	constructor(trailCapacity: number = 0) {
		this.trailCapacity = trailCapacity;
	}

	copy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionBookMark = [...this.decisionBookMark];
		newTrail.followUPIndex = this.followUPIndex;
		return newTrail;
	}

	getAssignments(): VariableAssignment[] {
		return this.assignments;
	}

	getDecisionBookMark(): number[] {
		return this.decisionBookMark;
	}

	getDecisions(): VariableAssignment[] {
		return this.decisionBookMark.map(mark => this.assignments[mark])
	}

	getPropagations(mark: number): VariableAssignment[] {
		const idx = this
		if (!uniqueBookMark.has(mark)) {
			throw Error("Can not have propagation of non decision assigment")
		} else {

		}
	}

	push(assignment: VariableAssignment) {
		if (this.assignments.length == this.trailCapacity)
			console.warn('[WARN]: skipped allocating assignment as trail capacity is fulfilled');
		else {
			this.assignments.push(assignment);
			if (assignment.isD()) {
				this.decisionLevel++;
				this.decisionBookMark.push(this.assignments.length - 1);
			}
		}
	}

	pop(): VariableAssignment | undefined {
		const returnValue = this.assignments.pop();
		if (returnValue?.isD()) {
			this.decisionLevel--;
			this.decisionBookMark.pop();
		}
		return returnValue;
	}

	indexOf(assignment: VariableAssignment): number {
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

	updateFollowUpIndex(): void {
		this.followUPIndex = this.assignments.length - 1;
	}
}
