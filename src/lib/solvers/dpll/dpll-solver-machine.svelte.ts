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
		if (activeId === dpll_stateName2StateId.empty_clause_state) {
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

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const occurrences: OccurrenceList = getOccurrenceListQueue().element();
		this.automaticStepByStep(() => !occurrences.traversed());
	}

	protected async solveCDStepByStep(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		this.automaticStepByStep(() => !queueOccurrences.isEmpty());
	}

	protected async unitPropagate(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		const previousUPs: number = getNoUnitPropagations();
		this.automaticStepByStep(
			() => previousUPs >= getNoUnitPropagations() && !queueOccurrences.isEmpty()
		);
	}

	onDetectingConflict(): boolean {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		return !queueOccurrences.isEmpty() && !this.onConflictState();
	}
}
