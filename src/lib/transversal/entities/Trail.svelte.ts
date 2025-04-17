import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import { logFatal } from '../utils/logging.ts';
import type Clause from './Clause.ts';

export class Trail {
	private assignments: VariableAssignment[] = [];
	private decisionLevelBookmark: Map<number, number> = new Map();
	private learned: Clause[] = [];
	private followUPIndex: number = -1;
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;

	constructor(trailCapacity: number = 0) {
		this.trailCapacity = trailCapacity;
	}

	copy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionLevelBookmark = new Map(this.decisionLevelBookmark);
		newTrail.learned = this.learned.map((clause) => clause);
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.decisionLevel = this.decisionLevel;
		newTrail.trailCapacity = this.trailCapacity;
		return newTrail;
	}

	getAssignments(): VariableAssignment[] {
		return [...this.assignments];
	}

	getDecisions(): VariableAssignment[] {
		const levels = [...this.decisionLevelBookmark.keys()].sort();
		const decisions: VariableAssignment[] = levels.map((level) => {
			const decisionIndex = this.decisionLevelBookmark.get(level) as number;
			return this.assignments[decisionIndex];
		});
		return decisions;
	}

	getPropagations(level: number): VariableAssignment[] {
		if (!this.decisionLevelExists(level)) {
			logFatal(`There is no such decision level: ${level}`);
		}
		const indexStart = this.decisionLevelBookmark.get(level) as number;
		let indexEnd;
		const nextLevel = level + 1;
		if (this.decisionLevelExists(nextLevel)) {
			indexEnd = this.decisionLevelBookmark.get(nextLevel) as number;
		} else {
			indexEnd = this.assignments.length;
		}
		console.log(this.assignments);
		console.log(this.decisionLevelBookmark);
		console.log('level', level, 'start', indexStart + 1, 'end', indexEnd);
		return this.assignments.slice(indexStart + 1, indexEnd);
	}

	push(assignment: VariableAssignment) {
		if (this.assignments.length == this.trailCapacity)
			logFatal('skipped allocating assignment as trail capacity is fulfilled');
		else {
			this.assignments.push(assignment);
			if (assignment.isD()) {
				this.registerNewDecisionLevel();
			}
		}
	}

	pop(): VariableAssignment | undefined {
		const returnValue = this.assignments.pop();
		if (returnValue?.isD()) {
			this.deleteCurrentDecisionLevel();
		}
		return returnValue;
	}

	learnedClauses(): Clause[] {
		return this.learned;
	}

	learn(clause: Clause): void {
		this.learned.push(clause);
	}

	updateFollowUpIndex(): void {
		this.followUPIndex = this.assignments.length - 1;
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

	private registerNewDecisionLevel(): void {
		const nextDecisionLevel = this.decisionLevel + 1;
		if (this.decisionLevelExists(nextDecisionLevel)) {
			logFatal(`Trying to save an existing decision level ${nextDecisionLevel}`);
		}
		this.decisionLevel = nextDecisionLevel;
		const startIndex = this.assignments.length - 1;
		this.decisionLevelBookmark.set(this.decisionLevel, startIndex);
	}

	private deleteCurrentDecisionLevel(): void {
		if (!this.decisionLevelExists(this.decisionLevel)) {
			logFatal(`Trying to delete current decision level but was not saved`);
		}
		this.decisionLevelBookmark.delete(this.decisionLevel);
		this.decisionLevel = this.decisionLevel - 1;
	}

	private decisionLevelExists(level: number): boolean {
		return this.decisionLevelBookmark.has(level);
	}
}
