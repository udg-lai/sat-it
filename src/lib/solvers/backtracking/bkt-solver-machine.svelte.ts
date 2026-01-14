import { getOccurrenceList, updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition,
	preConflictDetection
} from './bkt-solver-transitions.svelte.ts';
import { BKT_StateMachine, makeBKTStateMachine } from './bkt-state-machine.svelte.ts';
import { bkt_stateName2StateId } from './bkt-states.svelte.ts';
import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';

export const makeBKTSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine(getConfDelayMS());
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	constructor(stopTimeMS: number) {
		const stateMachine: BKT_StateMachine = makeBKTStateMachine();
		super(stateMachine, 'bkt', stopTimeMS);
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		// Initial state
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition();
		}
		// Waiting to analyze the following clause
		else if (activeId === bkt_stateName2StateId.traversed_occurrences_state) {
			preConflictDetection();
		} 
		// Waiting to do a decision
		else if (activeId === bkt_stateName2StateId.decide_state) {
			decide();
		}
		// Waiting to perform a backtracking
		else if (activeId === bkt_stateName2StateId.wipe_occurrence_queue_state) {
			backtracking();
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		this.automaticStepByStep(() => this.onDetectingConflict());
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.solveToNextVariableStepByStep();
	}

	onDetectingConflict(): boolean {
		const occurrenceList: OccurrenceList = getOccurrenceList();
		return !occurrenceList.isEmpty() && !this.stateMachine.onConflictState()
	}
}
