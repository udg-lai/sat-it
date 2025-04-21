import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import { logFatal } from '../utils/logging.ts';
import type Clause from './Clause.ts';

export class Trail {
	private assignments: VariableAssignment[] = [];
	private decisionLevelBookmark: number[] = [-1];
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
		newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
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
		return this.getDecisionLevelMarks().map((mark) => this.assignments[mark]);
	}

	getInitialPropagations(): VariableAssignment[] {
		return this.getPropagations(0);
	}

	getPropagations(level: number): VariableAssignment[] {
		if (level === 0) {
			return this.getLevelZeroPropagations();
		} else {
			return this.getLevelPropagations(level);
		}
	}

	hasPropagations(level: number): boolean {
		return this.getPropagations(level).length > 0;
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

	private getLevelZeroPropagations(): VariableAssignment[] {
		const startMark = 0;
		let endMark = this.assignments.length;
		if (this.hasDecisions()) {
			endMark = this.getMarkOfDecisionLevel(1);
		}
		return this.assignments.slice(startMark, endMark);
	}

	private getLevelPropagations(level: number): VariableAssignment[] {
		const startMark = this.getMarkOfDecisionLevel(level);
		let endMark;
		if (this.decisionLevelExists(level + 1)) {
			endMark = this.getMarkOfDecisionLevel(level + 1);
		} else {
			endMark = this.assignments.length;
		}
		return this.assignments.slice(startMark + 1, endMark);
	}

	private registerNewDecisionLevel(): void {
		const nextDecisionLevel = this.decisionLevel + 1;
		if (this.decisionLevelExists(nextDecisionLevel)) {
			logFatal(`Trying to save an existing decision level ${nextDecisionLevel}`);
		}
		this.decisionLevel = nextDecisionLevel;
		const decisionMark = this.assignments.length - 1;
		this.decisionLevelBookmark.push(decisionMark);
	}

	private deleteCurrentDecisionLevel(): void {
		if (!this.decisionLevelExists(this.decisionLevel)) {
			logFatal(`Trying to delete current decision level but was not saved`);
		}
		this.decisionLevelBookmark = this.decisionLevelBookmark.slice(0, -1);
		this.decisionLevel = this.decisionLevel - 1;
	}

	private decisionLevelExists(level: number): boolean {
		const levels = this.getDecisionLevelMarks();
		return level > 0 && level <= levels.length;
	}

	private getMarkOfDecisionLevel(level: number): number {
		if (!this.decisionLevelExists(level)) {
			logFatal(`Level ${level} does not exist`);
		}
		const levels = this.getDecisionLevelMarks();
		return levels[level - 1];
	}

	private getDecisionLevelMarks(): number[] {
		return this.decisionLevelBookmark.slice(1);
	}

	private hasDecisions(): boolean {
		const levels = this.getDecisionLevelMarks();
		return levels.length > 0;
	}
}
