import { type VisitingOccurrenceList } from '$lib/entities/OccurrenceList.svelte.ts';
import type { Queue } from '$lib/entities/Queue.svelte.ts';
import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/problem.svelte.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';
import {
	backtracking,
	conflictDetectionBlock,
	decide,
	initialTransition
} from './bkt-solver-transitions.svelte.ts';
import { BKT_StateMachine, makeBKTStateMachine } from './bkt-state-machine.svelte.ts';
import { bkt_stateName2StateId } from './bkt-states.svelte.ts';

export const makeBKTSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine(getConfDelayMS());
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	constructor(stopTimeMS: number) {
		const stateMachine: BKT_StateMachine = makeBKTStateMachine();
		super(stateMachine, 'backtracking', stopTimeMS);
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		// Initial state
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition();
		}
		// Waiting to analyze the following clause
		else if (activeId === bkt_stateName2StateId.traversed_occurrences_state) {
			conflictDetectionBlock();
		}
		// Waiting to do a decision
		else if (activeId === bkt_stateName2StateId.decide_state) {
			decide();
		}
		// Waiting to perform a backtracking
		else if (activeId === bkt_stateName2StateId.dequeue_occurrence_list_state) {
			backtracking();
		}
	}

	protected async traverseCurrentOccurrenceListStepByStep(): Promise<void> {
		// BKT only needs to check if it is in the conflict detection "area" to know if there are still occurrences to check.
		// The only exit points are either finding a conflict (conflict state) or traverse all clauses(decide or sat state).
		await this.automaticStepByStep(() => this.onDetectingConflict());
	}

	protected async solveCDStepByStep(): Promise<void> {
		await this.traverseCurrentOccurrenceListStepByStep();
	}

	onDetectingConflict(): boolean {
		const occurrenceQueue: Queue<VisitingOccurrenceList> = getOccurrenceListQueue();
		return !occurrenceQueue.isEmpty() && !this.stateMachine.onConflictState();
	}
}
