import { Queue } from '$lib/entities/Queue.svelte.ts';
import { updateClausesToCheck } from '$lib/states/conflict-detection-state.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { OccurrenceList } from '../types.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import {
	analyzeClause,
	conflictiveState,
	decide,
	initialTransition
} from './dpll-solver-transitions.svelte.ts';
import { DPLL_StateMachine, makeDPLLMachine } from './dpll-state-machine.svelte.ts';
import { dpll_stateName2StateId } from './dpll-states.svelte.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pendingConflicts: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());

	constructor() {
		const stateMachine: DPLL_StateMachine = makeDPLLMachine();
		super(stateMachine, 'dpll');
		this.pendingConflicts = new Queue<OccurrenceList>();
	}

	postpone(pendingItem: OccurrenceList): void {
		this.pendingConflicts.enqueue(pendingItem);
	}

	resolvePostponed(): OccurrenceList | undefined {
		return this.pendingConflicts.dequeue();
	}

	consultPostponed(): OccurrenceList {
		return this.pendingConflicts.pick();
	}

	thereArePostponed(): boolean {
		return !this.pendingConflicts.isEmpty();
	}

	leftToPostpone(): number {
		return this.pendingConflicts.size();
	}

	getQueue(): Queue<OccurrenceList> {
		const returnQueue: Queue<OccurrenceList> = new Queue();
		for (const originalItem of this.pendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(originalItem.clauses);
			const copiedItem: OccurrenceList = {
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
			updateClausesToCheck(new SvelteSet<number>(), -1);
			return;
		}
		const recordedPendingConflicts = record['queue'] as Queue<OccurrenceList>;
		this.pendingConflicts.clear();
		for (const pendingConflict of recordedPendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(pendingConflict.clauses);
			const copiedItem: OccurrenceList = {
				clauses: copiedSet,
				variableReasonId: pendingConflict.variableReasonId
			};
			this.pendingConflicts.enqueue(copiedItem);
		}
		if (!this.pendingConflicts.isEmpty()) {
			const conflict: OccurrenceList = this.pendingConflicts.pick();
			updateClausesToCheck(conflict.clauses, conflict.variableReasonId);
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();

		//The initial state
		if (activeId === dpll_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waiting to analyze the next clause or changing the clause set
		else if (activeId === dpll_stateName2StateId.delete_clause_state) {
			analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.empty_clause_set_state) {
			conflictiveState(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const postponedClauses: Set<number> = this.consultPostponed().clauses;
		this.stepByStep(() => postponedClauses.size !== 0);
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.stepByStep(() => !this.pendingConflicts.isEmpty());
	}

	onConflictDetection(): boolean {
		return !this.pendingConflicts.isEmpty() && !this.onConflictState();
	}
}
