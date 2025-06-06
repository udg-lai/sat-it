import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { Queue } from '$lib/transversal/entities/Queue.svelte.ts';
import { SolverMachine, type ConflictAnalysis } from '../SolverMachine.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition
} from './dpll-solver-transitions.svelte.ts';
import { makeDPLLMachine } from './dpll-state-machine.svelte.ts';
import { dpll_stateName2StateId } from './dpll-states.svelte.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pendingConflicts: Queue<ConflictAnalysis> = $state(new Queue<ConflictAnalysis>());

	constructor() {
		super(makeDPLLMachine());
		this.pendingConflicts = new Queue<ConflictAnalysis>();
	}

	postpone(pendingItem: ConflictAnalysis): void {
		this.pendingConflicts.enqueue(pendingItem);
	}

	resolvePostponed(): ConflictAnalysis | undefined {
		return this.pendingConflicts.dequeue();
	}

	consultPostponed(): ConflictAnalysis {
		return this.pendingConflicts.pick();
	}

	thereArePostponed(): boolean {
		return !this.pendingConflicts.isEmpty();
	}

	leftToPostpone(): number {
		return this.pendingConflicts.size();
	}

	getQueue(): Queue<ConflictAnalysis> {
		const returnQueue: Queue<ConflictAnalysis> = new Queue();
		for (const originalItem of this.pendingConflicts.toArray()) {
			const copiedSet = new Set<number>(originalItem.clauses);
			const copiedItem: ConflictAnalysis = {
				clauses: copiedSet,
				variableReasonId: originalItem.variableReasonId
			};
			returnQueue.enqueue(copiedItem);
		}
		return returnQueue;
	}

	getRecord(): Record<string, unknown> {
		return {
			queue: this.getQueue()
		};
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pendingConflicts = new Queue();
			updateClausesToCheck(new Set<number>(), -1);
			return;
		}
		const recordedPendingConflicts = record['queue'] as Queue<ConflictAnalysis>;
		this.pendingConflicts.clear();
		for (const pendingConflict of recordedPendingConflicts.toArray()) {
			const copiedSet = new Set<number>(pendingConflict.clauses);
			const copiedItem: ConflictAnalysis = {
				clauses: copiedSet,
				variableReasonId: pendingConflict.variableReasonId
			};
			this.pendingConflicts.enqueue(copiedItem);
		}
		if (!this.pendingConflicts.isEmpty()) {
			const conflict: ConflictAnalysis = this.pendingConflicts.pick();
			updateClausesToCheck(conflict.clauses, conflict.variableReasonId);
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();

		//The initial state
		if (activeId === dpll_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waiting to analyze the next clause of the clauses to revise
		else if (activeId === dpll_stateName2StateId.next_clause_state) {
			analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.backtracking_state) {
			backtracking(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const postponedClauses: Set<number> = this.consultPostponed().clauses;
		this.stepByStep(() => postponedClauses.size !== 0);
	}

	protected async solveUPStepByStep(): Promise<void> {
		this.stepByStep(() => !this.pendingConflicts.isEmpty());
	}

	onConflictDetection(): boolean {
		return !this.pendingConflicts.isEmpty();
	}
}
