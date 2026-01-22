import type OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import type { SolverCommand } from '$lib/events/events.ts';
import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import {
	conflictDetectionBlock,
	conflictiveState,
	decide,
	initialTransition
} from './dpll-solver-transitions.svelte.ts';
import { DPLL_StateMachine, makeDPLLMachine } from './dpll-state-machine.svelte.ts';
import { dpll_stateName2StateId } from './dpll-states.svelte.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine(getConfDelayMS());
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	constructor(stopTimeMS: number) {
		const stateMachine: DPLL_StateMachine = makeDPLLMachine();
		super(stateMachine, 'dpll', stopTimeMS);
	}

	async transitionByEvent(input: SolverCommand): Promise<void> {
		if (input === 'up1') {
			await this.unitPropagate();
		} else {
			super.transitionByEvent(input);
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();

		//The initial state
		if (activeId === dpll_stateName2StateId.unary_empty_clauses_detection_state) {
			initialTransition();
		}
		//Waiting to analyze the next clause or changing the clause set
		else if (activeId === dpll_stateName2StateId.traversed_occurrences_state) {
			conflictDetectionBlock();
		}
		//Waiting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide();
		}
		//Waiting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.wipe_occurrence_queue_state) {
			conflictiveState();
		}
	}

	protected async traverseCurrentOccurrenceListStepByStep(): Promise<void> {
		// To traverse the whole list, there are 2 different things that can happen:
		//	1. If a conflict has been found, the machine should wait for the user to notice this error.
		//	2. If the occurrence list has been analyzed, then we should upload the following occurrence list form the queue or go to the decision state.

		// Get the current occurrence list
		const occurrences: OccurrenceList = getOccurrenceListQueue().element();

		// Either traverse it or find a conflict.
		await this.automaticStepByStep(() => !occurrences.traversed() && !this.onConflictState());

		// If there is no conflict, then we need to do an extra step for either uploading the following occurrence list or continue to the decision state.
		// Because of this, an extra step should be done.
		if (!this.onConflictState()) {
			this.step();
		}
	}

	protected async solveCDStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => this.onDetectingConflict());
	}

	protected async unitPropagate(): Promise<void> {
		const previousUPs: number = getNoUnitPropagations();
		await this.automaticStepByStep(
			() => previousUPs >= getNoUnitPropagations() && this.onDetectingConflict()
		);
	}

	onDetectingConflict(): boolean {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		return !queueOccurrences.isEmpty() && !this.onConflictState();
	}
}
