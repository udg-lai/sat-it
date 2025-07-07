import { getProblemStore } from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { makeLeft, makeRight, type Either } from '../types/either.ts';
import type Clause from './Clause.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type UnitPropagation } from './VariableAssignment.ts';

export type TrailState = 'sat' | 'unsat' | 'conflict' | 'running';

export interface UPContext {
	clauseTag: number;
	literal: number;
}

export interface ConflictAnalysisContext {
	clause: Clause;
	literal: number;
}

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private decisionLevelBookmark: number[] = $state([-1]);
	private followUPIndex: number = 0;
	private decisionLevel: number = 0;
	private conflictAnalysisCtx: Either<ConflictAnalysisContext, undefined>[] = $state([]); // this is just for representing the conflict analysis view
	private upContext: Either<UPContext, undefined>[] = $derived.by(() => this._upContext());
	private fullView: boolean = $state(true); // UI state for knowing whenever for that trail it was required to show more information
	private trailHeight: number = $state(0); // trail height in px
	private learntClause: Clause | undefined = $state(undefined);
	private conflictiveClause: Clause | undefined = $state(undefined);
	private state: TrailState = $state('running');

	copy(): Trail {
		const newTrail = new Trail();
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.decisionLevel = this.decisionLevel;
		newTrail.learnClause = this.learnClause;
		newTrail.conflictiveClause = this.conflictiveClause;
		return newTrail;
	}

	setState(state: TrailState): void {
		this.state = state;
	}

	getState(): TrailState {
		return this.state;
	}

	//This partial copy is needed as we don't want to have the same "conflictiveClause" and "learnedClause" as this function is meant for creating the new "latestTrail"
	partialCopy(): Trail {
		const newTrail = new Trail();
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
		newTrail.followUPIndex = this.followUPIndex;
		newTrail.decisionLevel = this.decisionLevel;
		return newTrail;
	}

	getDecisionLevel(): number {
		return this.decisionLevel;
	}

	getAssignments(): VariableAssignment[] {
		return [...this.assignments];
	}

	getFollowUpAssignments(): VariableAssignment[] {
		return this.assignments.slice(this.followUPIndex);
	}

	pickLastAssignment(): VariableAssignment {
		return this.assignments[this.assignments.length - 1];
	}

	getDecisions(): VariableAssignment[] {
		return this.getDecisionLevelMarks().map((mark) => this.assignments[mark]);
	}

	getInitialPropagations(): VariableAssignment[] {
		return this.getPropagationsAt(0);
	}

	getPropagationsAt(level: number): VariableAssignment[] {
		return this._propagationsAt(level);
	}

	getAssignmentsAt(level: number): VariableAssignment[] {
		if (level === 0) {
			return this._propagationsAt(0);
		} else {
			return this._assignmentsAt(level);
		}
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

	setConflictiveClause(clause: Clause): void {
		this.conflictiveClause = clause;
	}

	hasConflictiveClause(): boolean {
		return this.conflictiveClause !== undefined;
	}

	getConflictiveClause(): Clause | undefined {
		return this.conflictiveClause;
	}

	clean(): void {
		this._clean();
	}

	getConflictAnalysisCtx(): Either<ConflictAnalysisContext, undefined>[] {
		return this._makeConflictAnalysisCtx();
	}

	updateConflictAnalysisCtx(ctx: ConflictAnalysisContext | undefined = undefined): void {
		const ca: Either<ConflictAnalysisContext, undefined> =
			ctx === undefined ? makeRight(undefined) : makeLeft(ctx);
		this.conflictAnalysisCtx = [ca, ...this.conflictAnalysisCtx];
	}

	hasPropagations(level: number): boolean {
		return this.getPropagationsAt(level).length > 0;
	}

	push(assignment: VariableAssignment) {
		this.assignments.push(assignment);
		if (assignment.isD()) {
			this.registerNewDecisionLevel();
		}
	}

	pop(): VariableAssignment | undefined {
		const returnValue = this.assignments.pop();
		if (returnValue?.isD()) {
			this.deleteCurrentDecisionLevel();
		}
		return returnValue;
	}

	getLearntClause(): Clause | undefined {
		return this.learntClause;
	}

	learnClause(lemma: Clause): void {
		this.learntClause = lemma;
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
			logFatal('Decision level error', 'The entered decision level is not valid');
		}

		// As the propagations are not meant to be deleted, the DL+1 is obtained
		const targetIndex =
			dl === 0 ? this.getMarkOfDecisionLevel(1) : this.getMarkOfDecisionLevel(dl + 1);
		while (this.assignments.length > targetIndex) {
			const last: VariableAssignment = this.pop() as VariableAssignment;
			getProblemStore().variables.unassign(last.getVariable().getInt());
		}

		// Set the new decision level parameters
		this.decisionLevelBookmark = this.decisionLevelBookmark.slice(0, dl + 1);
		this.decisionLevel = dl;
	}

	getUPContext(): Either<UPContext, undefined>[] {
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

	private _propagationsAt(level: number): VariableAssignment[] {
		if (level === 0) {
			const startMark = 0;
			let endMark = this.assignments.length;
			if (this.hasDecisions()) {
				endMark = this.getMarkOfDecisionLevel(1);
			}
			return this.assignments.slice(startMark, endMark);
		} else {
			const startMark = this.getMarkOfDecisionLevel(level);
			let endMark;
			if (this.decisionLevelExists(level + 1)) {
				endMark = this.getMarkOfDecisionLevel(level + 1);
			} else {
				endMark = this.assignments.length;
			}
			return this.assignments.slice(startMark + 1, endMark);
		}
	}

	private _assignmentsAt(level: number): VariableAssignment[] {
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

	private _upContext(): Either<UPContext, undefined>[] {
		return this.assignments.map((a: VariableAssignment) => {
			if (a.isUP()) {
				const reason = a.getReason() as UnitPropagation;
				return makeLeft({
					clauseTag: reason.clauseTag,
					literal: a.toInt()
				});
			} else {
				return makeRight(undefined);
			}
		});
	}

	private _clean(): void {
		this.conflictiveClause = undefined;
		this.conflictAnalysisCtx = [];
		this.learntClause = undefined;
		this.conflictiveClause = undefined;
		this.state = 'running';
	}

	private _makeConflictAnalysisCtx(): Either<ConflictAnalysisContext, undefined>[] {
		const nAssignments: number = this.assignments.length;
		const gaps: number = Math.max(nAssignments - this.conflictAnalysisCtx.length, 0);
		const ctx: Either<ConflictAnalysisContext, undefined>[] = [
			...Array<Either<ConflictAnalysisContext, undefined>>(gaps).fill(makeRight(undefined)),
			...this.conflictAnalysisCtx,
			this._makeConflictAnalysisCtxTail()
		];
		return ctx;
	}

	private _makeConflictAnalysisCtxTail(): Either<ConflictAnalysisContext, undefined> {
		if (this.getConflictiveClause() === undefined) {
			logFatal('Trail', 'Can not generate conflict analysis context when there is no conflictive declared');
		}
		return makeLeft({
			clause: this.getConflictiveClause() as Clause,
			literal: 0
		})
	}
}
