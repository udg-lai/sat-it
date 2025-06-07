import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { SolverMachine, type ConflictAnalysis } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition
} from './bkt-solver-transitions.svelte.ts';
import { makeBKTMachine } from './bkt-state-machine.svelte.ts';
import { bkt_stateName2StateId } from './bkt-states.svelte.ts';

export const makeBKTSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine();
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor() {
		super(makeBKTMachine());
		this.conflictAnalysis = undefined;
	}

	resolveConflict(): void {
		this.conflictAnalysis = undefined;
	}

	setConflict(conflict: ConflictAnalysis): void {
		this.conflictAnalysis = conflict;
	}

	visitClause(clauseId: number): void {
		if (this.conflictAnalysis === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at visiting a clause in the BKT Solver Machine'
			);
		}

		const { clauses }: ConflictAnalysis = this.conflictAnalysis;

		if (!clauses.has(clauseId)) {
			logFatal('Clause not found', 'Error at removing a clause from the BKT Solver Machine');
		} else {
			clauses.delete(clauseId);
		}
	}

	consultConflict(): ConflictAnalysis {
		if (this.conflictAnalysis === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at consulting a conflict in the BKT Solver Machine'
			);
		}
		return this.conflictAnalysis;
	}

	getRecord(): Record<string, unknown> {
		return {
			pending: this.makeConflictAnalysisCopy()
		};
	}

	private makeConflictAnalysisCopy(): ConflictAnalysis | undefined {
		if (this.conflictAnalysis !== undefined) {
			const clauses: Set<number> = new Set<number>([...this.conflictAnalysis.clauses.values()]);
			const variableReasonId: number = this.conflictAnalysis.variableReasonId;
			return { clauses, variableReasonId };
		}
		return undefined;
	}

	// ** abstract functions **
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.conflictAnalysis = undefined;
			updateClausesToCheck(new Set<number>(), -1);
			return;
		}
		const conflictRecord: ConflictAnalysis = record['pending'] as ConflictAnalysis;
		this.setConflict(conflictRecord);
		if (this.onConflictDetection()) {
			const { clauses, variableReasonId }: ConflictAnalysis = conflictRecord;
			updateClausesToCheck(clauses, variableReasonId);
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		} else if (activeId === bkt_stateName2StateId.next_clause_state) {
			analyzeClause(this);
		} else if (activeId === bkt_stateName2StateId.decide_state) {
			decide(this);
		} else if (activeId === bkt_stateName2StateId.backtracking_state) {
			backtracking(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		this.stepByStep(() => this.onConflictDetection());
	}

	protected async solveUPStepByStep(): Promise<void> {
		this.solveToNextVariableStepByStep();
	}

	onConflictDetection(): boolean {
		if (this.conflictAnalysis === undefined) {
			return false;
		} else {
			const { clauses }: ConflictAnalysis = this.conflictAnalysis;
			return clauses.size > 0;
		}
	}
}
