import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { getProblemStore } from '$lib/store/problem.svelte.ts';
import TemporalClause from './TemporalClause.ts';

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private decisionLevelBookmark: number[] = $state([-1]);
	private learned: TemporalClause | undefined = undefined;
	private followUPIndex: number = -1;
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;
	private trailConflict: number | undefined = $state(undefined);

	constructor(trailCapacity: number = 0) {
		this.trailCapacity = trailCapacity;
	}

	copy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
		newTrail.learned = this.learned;
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.decisionLevel = this.decisionLevel;
		newTrail.trailCapacity = this.trailCapacity;
		newTrail.trailConflict = this.trailConflict;
		return newTrail;
	}

	//This partial copy is needed to avoid having the same trailEnding and
	partialCopy(): Trail {
		const newTrail = new Trail(this.trailCapacity);
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.decisionLevel = this.decisionLevel;
		newTrail.trailCapacity = this.trailCapacity;
		return newTrail;
	}

	getDecisionLevel(): number {
		return this.decisionLevel;
	}

	getAssignments(): VariableAssignment[] {
		return [...this.assignments];
	}

	pickLastAssignment(): VariableAssignment {
		return this.assignments[this.assignments.length - 1];
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

	getLevelAssignments(level: number): VariableAssignment[] {
		if (level === 0) {
			return this.getLevelZeroPropagations();
		} else {
			return this.getLvlAssignments(level);
		}
	}

	getTrailConflict(): number | undefined {
		return this.trailConflict;
	}

	getVariableDecisionLevel(variable: number): number {
		const index = this.assignments.findIndex((a) => a.getVariable().getInt() === variable);
		if (index === -1) {
			logFatal(`Variable ${variable} not found in trail`);
		}

		for (let level = this.decisionLevelBookmark.length - 1; level >= 0; level--) {
			if (index >= this.decisionLevelBookmark[level]) {
				return level;
			}
		}
		logFatal(`Unable to determine decision level for variable ${variable}`);
	}

	updateTrailConflict(clauseId: number): void {
		this.trailConflict = clauseId;
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

	getLearnedClause(): TemporalClause | undefined {
		return this.learned;
	}

	learn(clause: TemporalClause): void {
		this.learned = clause;
	}

	updateFollowUpIndex(): void {
		this.followUPIndex = this.assignments.length - 1;
	}

	backjump(dl: number): void {
		// Security check
		if (dl < 0 || dl > this.decisionLevel) {
			logFatal('DL error', 'The entered DL is not valid');
		}

		// We get the mark of the DL+1 as we don't want to remove the propagations.
		const targetIndex =
			dl === 0 ? this.getMarkOfDecisionLevel(1) : this.getMarkOfDecisionLevel(dl + 1);
		while (this.assignments.length > targetIndex) {
			const last: VariableAssignment = this.pop() as VariableAssignment;
			getProblemStore().variables.dispose(last.getVariable().getInt());
		}

		//Set the new dl parameters
		this.decisionLevelBookmark = this.decisionLevelBookmark.slice(0, dl + 1);
		this.decisionLevel = dl;
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

	private getLvlAssignments(level: number): VariableAssignment[] {
		const startMark = this.getMarkOfDecisionLevel(level);
		let endMark;
		if (this.decisionLevelExists(level + 1)) {
			endMark = this.getMarkOfDecisionLevel(level + 1);
		} else {
			endMark = this.assignments.length;
		}
		return this.assignments.slice(startMark, endMark);
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
