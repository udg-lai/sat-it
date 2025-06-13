import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { SolverMachine, type ConflictDetection } from '../SolverMachine.svelte.ts';
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
	conflictDetection: ConflictDetection | undefined = $state(undefined);

	constructor() {
		super(makeBKTMachine());
		this.conflictDetection = undefined;
	}

	resolveConflict(): void {
		this.conflictDetection = undefined;
	}

	setConflict(conflict: ConflictDetection): void {
		this.conflictDetection = conflict;
	}

	visitClause(clauseId: number): void {
		if (this.conflictDetection === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at visiting a clause in the BKT Solver Machine'
			);
		}

		const { clauses }: ConflictDetection = this.conflictDetection;

		if (!clauses.has(clauseId)) {
			logFatal('Clause not found', 'Error at removing a clause from the BKT Solver Machine');
		} else {
			clauses.delete(clauseId);
		}
	}

	consultConflict(): ConflictDetection {
		if (this.conflictDetection === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at consulting a conflict in the BKT Solver Machine'
			);
		}
		return this.conflictDetection;
	}

	getRecord(): Record<string, unknown> {
		return {
			pending: this.makeConflictDetectionCopy()
		};
	}

	private makeConflictDetectionCopy(): ConflictDetection | undefined {
		if (this.conflictDetection !== undefined) {
			const clauses: Set<number> = new Set<number>([...this.conflictDetection.clauses.values()]);
			const variableReasonId: number = this.conflictDetection.variableReasonId;
			return { clauses, variableReasonId };
		}
		return undefined;
	}

	// ** abstract functions **
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.conflictDetection = undefined;
			updateClausesToCheck(new Set<number>(), -1);
			return;
		}
		const conflictRecord: ConflictDetection = record['pending'] as ConflictDetection;
		this.setConflict(conflictRecord);
		if (this.onConflictDetection()) {
			const { clauses, variableReasonId }: ConflictDetection = conflictRecord;
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

	protected async solveCDStepByStep(): Promise<void> {
		this.solveToNextVariableStepByStep();
	}

	onConflictDetection(): boolean {
		if (this.conflictDetection === undefined) {
			return false;
		} else {
			const { clauses }: ConflictDetection = this.conflictDetection;
			return clauses.size > 0;
		}
	}
}
