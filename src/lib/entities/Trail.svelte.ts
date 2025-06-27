import { getClausePool, getProblemStore } from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { makeLeft, makeRight, type Either } from '../types/either.ts';
import type Clause from './Clause.svelte.ts';
import type ClausePool from './ClausePool.svelte.ts';
import type TemporalClause from './TemporalClause.ts';
import {
	isUnitPropagationReason,
	type Reason,
	type UnitPropagation
} from './VariableAssignment.ts';
import type VariableAssignment from './VariableAssignment.ts';

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private decisionLevelBookmark: number[] = $state([-1]);
	private learned: TemporalClause | undefined = undefined;
	private followUPIndex: number = -1;
	private decisionLevel: number = 0;
	private trailCapacity: number = 0;
	private conflictiveClause: number | undefined = $state(undefined);
	private learntClause: number | undefined = $state(undefined); // this is for doing undo algorithmic
	private conflictAnalysisCtx: Either<TemporalClause, undefined>[] = $state([]); // this is just for representing the conflict analysis view
	private latestLevelUPCtx: number[] = $derived.by(() => this._computeLatestLevelUPContext());
	private upContext: Either<number, undefined>[] = $derived.by(() => this._upContext());
	private fullView: boolean = $state(false); // UI state for knowing whenever for that trail it was required to show more information
	private trailHeight: number = $state(0); // trail height in px

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
		newTrail.conflictiveClause = this.conflictiveClause;
		return newTrail;
	}

	//This partial copy is needed as we don't want to have the same "conflictiveClause" and "learnedClause" as this function is meant for creating the new "latestTrail"
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
		return this.conflictiveClause;
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

	setConflict(clauseId: number): void {
		this.conflictiveClause = clauseId;
		this._initConflictAnalysisCtx(clauseId);
	}

	getConflictAnalysisCtx(): Either<TemporalClause, undefined>[] {
		return this.conflictAnalysisCtx;
	}

	updateConflictAnalysisCtx(clause: TemporalClause | undefined = undefined): void {
		this.conflictAnalysisCtx.push(clause === undefined ? makeRight(clause) : makeLeft(clause));
	}

	getLatestLevelUPCtx(): Clause[] {
		const clauses = getClausePool();
		return this.latestLevelUPCtx.map(clauses.get);
	}

	private _initConflictAnalysisCtx(clauseId: number): void {
		const clauses: ClausePool = getClausePool();
		const clause: TemporalClause = clauses.get(clauseId).toTemporalClause();
		this.conflictAnalysisCtx.push(makeLeft(clause));
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

	getFollowUpIndex(): number {
		return this.followUPIndex;
	}

	setFollowUpIndex(): void {
		this.followUPIndex = this.assignments.length - 1;
	}

	isAssignmentFromPreviousTrail(assignment: VariableAssignment): boolean {
		const assignmentIndex: number = this.assignments.indexOf(assignment);
		return assignmentIndex < this.followUPIndex;
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
			getProblemStore().variables.unassign(last.getVariable().getInt());
		}

		//Set the new dl parameters
		this.decisionLevelBookmark = this.decisionLevelBookmark.slice(0, dl + 1);
		this.decisionLevel = dl;

		this.updateFollowUpIndex();
	}

	getUPContext(): Either<number, undefined>[] {
		return this.upContext;
	}

	toggleView(): void {
		this.fullView = !this.fullView;
	}

	setView(view: boolean): void {
		this.fullView = view;
	}

	view(): boolean {
		return this.fullView;
	}

	setHeight(height: number): void {
		this.trailHeight = height;
	}

	getHeight(): number {
		return this.trailHeight;
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

	private _upContext(): Either<number, undefined>[] {
		return this.assignments.map((a) => {
			if (a.isUP()) {
				const reason = a.getReason() as UnitPropagation;
				return makeLeft(reason.clauseId);
			} else {
				return makeRight(undefined);
			}
		});
	}

	private _computeLatestLevelUPContext(): number[] {
		const latestLevelIndex = this.decisionLevelBookmark.at(-1);
		if (latestLevelIndex === undefined || latestLevelIndex === -1) return [];
		else {
			const propagations: VariableAssignment[] = this.assignments.slice(latestLevelIndex + 1);
			const reasons: number[] = propagations.map((p) => {
				const reason: Reason = p.getReason();
				if (!isUnitPropagationReason(reason))
					logFatal('Trail', `Unexpected UP reason but ${reason} was given`);
				return reason.clauseId;
			});
			return reasons;
		}
	}
}
