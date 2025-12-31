import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit, NeverFn, Var } from '$lib/types/types.ts';
import { error } from '$lib/utils.ts';
import { makeLeft, makeRight, type Either } from '../types/either.ts';
import type Clause from './Clause.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type UnitPropagation } from './VariableAssignment.ts';

export type TrailState = 'sat' | 'unsat' | 'conflict' | 'running';

// Represents the propagated literal and the reason cRef
export interface UPContext {
	reasonCRef: CRef;
	propagated: Lit;
}

export interface ResolutionContext {
	clause: Clause;
}

export class Trail {
	private assignments: VariableAssignment[] = $state([]);
	private bookmarkDL: number[] = $state([-1]);
	private dl: number = 0;
	private resolutionCtx: Either<ResolutionContext, NeverFn>[] = $state([]); // this is just for representing the conflict analysis view
	private upContext: Either<UPContext, NeverFn>[] = $derived.by(() => this._upContext());
	private showCtxView: boolean = $state(false); // UI state for knowing whenever for that trail it was required to show more information
	private lemma: Clause | undefined = $state(undefined);
	private conflictiveClause: Clause | undefined = $state(undefined);
	private state: TrailState = $state('running');
	private trailHeight: number = $derived.by(() => this._computeHeight());
	private readonly defaultTrailHeight: number = 56;
	private readonly canvasHeight: number = 150;

	copy(): Trail {
		const newTrail = new Trail();
		newTrail.assignments = this.assignments.map((assignment) => assignment.copy());
		newTrail.bookmarkDL = [...this.bookmarkDL];
		newTrail.dl = this.dl;
		newTrail.lemma = this.lemma;
		newTrail.conflictiveClause = this.conflictiveClause;
		newTrail.resolutionCtx = [...this.resolutionCtx];
		newTrail.state = this.state;
		return newTrail;
	}

	isEmpty(): boolean {
		return this.assignments.length === 0;
	}

	setState(state: TrailState): void {
		this.state = state;
	}

	getState(): TrailState {
		return this.state;
	}

	cleanConflict(): void {
		this.conflictiveClause = undefined;
		this.resolutionCtx = [];
		this.lemma = undefined;
		this.state = 'running';
	}

	getDL(): number {
		return this.dl;
	}

	getAssignments(): VariableAssignment[] {
		return [...this.assignments];
	}

	getFollowUpAssignments(trailStart: number): VariableAssignment[] {
		return this.assignments.slice(trailStart);
	}

	lastAssignment(): VariableAssignment {
		if (this.isEmpty()) {
			logFatal('Trail underflow', 'Trying to get the last assignment from an empty trail');
		}
		return this.assignments[this.assignments.length - 1];
	}

	lastDecision(): VariableAssignment {
		if (this.isEmpty() || this.getDLMarks().length < 1) {
			logFatal(
				'Trail underflow',
				'Trying to get the last decision from an empty trail or trail with no decisions'
			);
		}
		const lastDLIndex = this.getDLMarks()[this.getDLMarks().length - 1];
		return this.assignments[lastDLIndex];
	}

	getDecisions(): VariableAssignment[] {
		return this.getDLMarks().map((mark) => this.assignments[mark]);
	}

	getInitialPropagations(): VariableAssignment[] {
		return this.getPropagationsAtLevel(0);
	}

	getPropagationsAtLevel(level: number): VariableAssignment[] {
		return this._propagationsAt(level);
	}

	getAssignmentsAtLevel(level: number): VariableAssignment[] {
		if (level === 0) {
			return this._propagationsAt(0);
		} else {
			return this._assignmentsAt(level);
		}
	}

	getVariableDL(varId: Var): number {
		const varIdx = this.assignments.findIndex((a) => a.getVariable().toInt() === varId);
		if (varIdx === -1) {
			logFatal(`Variable ${varId} not found in trail`);
		}
		for (let dl = this.bookmarkDL.length - 1; dl >= 0; dl--) {
			if (varIdx >= this.bookmarkDL[dl]) {
				return dl;
			}
		}
		logFatal(`Unable to determine decision level for variable ${varId}`);
	}

	indexOfAssignment(varAssignment: VariableAssignment): number {
		const index = this.assignments.indexOf(varAssignment);
		if (index === -1) {
			logError('Assignment index error', 'The variable assignment does not belong to the trail.');
		}
		return index;
	}

	attachConflictiveClause(clause: Clause): void {
		this.conflictiveClause = clause;
	}

	hasConflictiveClause(): boolean {
		return this.conflictiveClause !== undefined;
	}

	getConflictiveClause(): Clause | undefined {
		return this.conflictiveClause;
	}

	getResolutionContext(): Either<ResolutionContext, NeverFn>[] {
		return this._makeResolutionContext();
	}

	updateResolutionContext(clause: Clause | undefined = undefined): void {
		const ca: Either<ResolutionContext, NeverFn> =
			clause === undefined ? makeRight(error) : makeLeft({ clause });
		this.resolutionCtx = [ca, ...this.resolutionCtx];
	}

	hasPropagations(level: number): boolean {
		return this.getPropagationsAtLevel(level).length > 0;
	}

	push(assignment: VariableAssignment): void {
		this.assignments.push(assignment);
		if (assignment.isD()) {
			this.registerNewDecisionLevel();
		}
	}

	pop(): VariableAssignment {
		if (this.isEmpty()) {
			logFatal('Trail underflow', 'Trying to pop from an empty trail');
		}
		const assignment = this.assignments.pop() as VariableAssignment;
		if (assignment.isD()) {
			this.shrinkOneDL();
		}
		return assignment;
	}

	size(): number {
		return this.assignments.length;
	}

	getAttachedLemma(): Clause {
		// Calling this function when no clause was learned is an error
		if (!this.hasLemmaAttached())
			logFatal('Getting learned clause', 'No clause was learned in this trail');
		return this.lemma as Clause;
	}

	hasLemmaAttached(): boolean {
		return this.lemma !== undefined;
	}

	attachLemma(clause: Clause): void {
		if (!clause.isLemma()) {
			logFatal('Attaching learned clause', 'Clause to be attached is not marked as learned');
		}
		this.lemma = clause;
	}

	getUPContext(): Either<UPContext, NeverFn>[] {
		return this.upContext;
	}

	getMarkOfDecisionLevel(dl: number): number {
		// Returns from the mapping of decision levels to index, where it occurs in the list of assignments
		if (!this.dlExists(dl)) {
			logFatal(`Level ${dl} does not exist`);
		}
		const levels = this.getDLMarks();
		return levels[dl - 1];
	}

	toggleCtx(): void {
		this.showCtxView = !this.showCtxView;
	}

	hideCtx(): void {
		this.showCtxView = false;
	}

	showCtx(): void {
		this.showCtxView = true;
	}

	showingCtx(): boolean {
		return this.showCtxView;
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
			if (this.dlExists(level + 1)) {
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
		if (this.dlExists(level + 1)) {
			endMark = this.getMarkOfDecisionLevel(level + 1);
		} else {
			endMark = this.assignments.length;
		}
		return this.assignments.slice(startMark, endMark);
	}

	private registerNewDecisionLevel(): void {
		const nextDecisionLevel = this.dl + 1;
		if (this.dlExists(nextDecisionLevel)) {
			logFatal(`Trying to save an existing decision level ${nextDecisionLevel}`);
		}
		this.dl = nextDecisionLevel;
		const decisionMark = this.assignments.length - 1;
		this.bookmarkDL.push(decisionMark);
	}

	private shrinkOneDL(): void {
		if (!this.dlExists(this.dl)) {
			logFatal(`Trying to delete current decision level but was not saved`);
		}
		this.bookmarkDL = this.bookmarkDL.slice(0, -1);
		this.dl = this.dl - 1;
	}

	private dlExists(level: number): boolean {
		const levels = this.getDLMarks();
		return level > 0 && level <= levels.length;
	}

	private getDLMarks(): number[] {
		return this.bookmarkDL.slice(1);
	}

	private hasDecisions(): boolean {
		const levels = this.getDLMarks();
		return levels.length > 0;
	}

	private _upContext(): Either<UPContext, NeverFn>[] {
		return this.assignments.map((a: VariableAssignment) => {
			if (a.wasPropagated()) {
				const reason = a.getReason() as UnitPropagation;
				return makeLeft({
					reasonCRef: reason.cRef,
					propagated: a.toLit()
				});
			} else {
				return makeRight(error);
			}
		});
	}

	private _makeResolutionContext(): Either<ResolutionContext, NeverFn>[] {
		const nAssignments: number = this.assignments.length;
		const gaps: number = Math.max(nAssignments - this.resolutionCtx.length, 0);
		const ctx: Either<ResolutionContext, NeverFn>[] = [
			...Array<Either<ResolutionContext, NeverFn>>(gaps).fill(makeRight(error)),
			...this.resolutionCtx,
			this._makeConflictAnalysisCtxTail()
		];
		return ctx;
	}

	private _makeConflictAnalysisCtxTail(): Either<ResolutionContext, NeverFn> {
		if (this.getConflictiveClause() === undefined) {
			logFatal(
				'Trail',
				'Can not generate conflict analysis context when there is no conflictive declared'
			);
		}
		return makeLeft({
			clause: this.getConflictiveClause() as Clause,
			literal: 0
		});
	}

	private _computeHeight(): number {
		let height = this.defaultTrailHeight;
		if (this.showCtxView) {
			const solver = getSolverMachine();
			if (solver.identify() === 'bkt') {
				if (this.conflictiveClause !== undefined) {
					height += this.canvasHeight; // Extra height for conflictive clause
				}
			} else {
				height += this.canvasHeight; // Extra height for ups
				if (this.hasConflictiveClause()) {
					height += this.canvasHeight; // Extra height for conflictive clause and conflict analysis
				}
			}
		}
		return height;
	}
}
