import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import { logFatal } from '../utils/logging.ts';

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private decisionBookMark: number[] = [];
	private followUPIndex: number = -1;
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
		return [...this.assignments];
	}

	getDecisionBookMark(): number[] {
		return this.decisionBookMark;
	}

	getDecisions(): VariableAssignment[] {
		return this.decisionBookMark.map(mark => this.assignments[mark])
	}

	getPropagations(mark: number): VariableAssignment[] {
		const idx = this.getMarkIndex(mark);
		const isLastMark = (idx: number): boolean => {
			return this.decisionBookMark.length - 1 === idx;
		}
		let propagations: VariableAssignment[] = [];
		if (isLastMark(idx)) {
			propagations = this.assignments.slice(idx)
		} else {
			const nextDecisionIdx = this.decisionBookMark[idx + 1];
			propagations = this.assignments.slice(idx, nextDecisionIdx);
		}
		return propagations;
	}

	push(assignment: VariableAssignment) {
		if (this.assignments.length == this.trailCapacity)
			logFatal("skipped allocating assignment as trail capacity is fulfilled");
		else {
			this.assignments.push(assignment);
			if (assignment.isD()) {
				this.decisionLevel++;
				this.registerDecisionMark();
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

	private registerDecisionMark(): void {
		const mark = this.assignments.length - 1;
		if (this.markAlreadyExists(mark)) {
			logFatal("Adding an existing mark", `Can not register mark ${mark} because it already exists`)
		} else {
			this.decisionBookMark.push(mark);
		}
	}

	private markAlreadyExists(mark: number): boolean {
		return new Set(this.decisionBookMark).has(mark);
	}

	private getMarkIndex(mark: number): number {
		if (mark < 0 || mark >= this.trailCapacity) {
			logFatal("Mark out of range", `Mark ${mark} out of range`)
		}
		const idx = this.decisionBookMark.findIndex(m => m === mark)
		if (idx === -1) {
			logFatal("Mark does not exist", `Mark ${mark} not found in decision book mark`)
		}
		return idx;
	}
}
