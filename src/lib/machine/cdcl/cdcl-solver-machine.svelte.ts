import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import type Clause from '$lib/transversal/entities/Clause.ts';
import { Queue } from '$lib/transversal/entities/Queue.svelte.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { SolverMachine, type ConflictAnalysis } from '../SolverMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition
} from './cdcl-solver-transitions.svelte.ts';
import { makeCDCLMachine } from './cdcl-state-machine.svelte.ts';
import { cdcl_stateName2StateId } from './cdcl-states.svelte.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine();
};

export type FirstUIP = {
	trail: Trail; // The trail that will be modified and will turn into the last trail.
	conflictClause: Clause; // The clause that will be learned.
	decisionLevelVariables: number[]; // The variables from the last DL.
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	// Queue that will contain all those Set of clauses that need to be checked.
	pendingConflicts: Queue<ConflictAnalysis> = $state(new Queue<ConflictAnalysis>());
	// This variable contains all the information for the machine to find the firstUIP.
	firstUIP: FirstUIP | undefined = $state(undefined);

	constructor() {
		super(makeCDCLMachine());
		this.pendingConflicts = new Queue<ConflictAnalysis>();
	}

	// ** functions related to pendingConflicts **
	postpone(pendingConflict: ConflictAnalysis): void {
		this.pendingConflicts.enqueue(pendingConflict);
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

	// ** functions related to firstUIP **

	buildFUIP(trail: Trail, conflictClause: Clause, decisionLevelVariables: number[]): void {
		this.firstUIP = { trail, conflictClause, decisionLevelVariables };
	}

	// ** general functions **

	getRecord(): Record<string, unknown> {
		return {
			queue: this.getQueue(),
			firstUIP: this.firstUIP
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
		if (activeId === cdcl_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waiting to analyze the next clause of the clauses to revise
		else if (activeId === cdcl_stateName2StateId.next_clause_state) {
			analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === cdcl_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === cdcl_stateName2StateId.pick_last_assignment_state) {
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
