import type { VisitingOccurrenceList } from '$lib/entities/OccurrenceList.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import { type SolverCommand } from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
import { getCurrentOccurrences, getOccurrenceListQueue } from '$lib/states/problem.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
import { unwrapEither } from '$lib/types/either.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	conflictAnalysisBlock,
	conflictDetectionBlock,
	decide,
	initialTransition,
	preConflictAnalysis
} from './cdcl-solver-transitions.svelte.ts';
import { CDCL_StateMachine, makeCDCLStateMachine } from './cdcl-state-machine.svelte.ts';
import { cdcl_stateName2StateId } from './cdcl-states.svelte.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine(getConfDelayMS());
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	constructor(stopTimeMS: number) {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl', stopTimeMS);
	}
	// ** functions related to conflict analysis **

	async transitionByEvent(event: SolverCommand): Promise<void> {
		if (event === 'finishCA') {
			await this.solveCAStepByStep();
		} else if (event === 'up1') {
			await this.unitPropagate();
		} else {
			await super.transitionByEvent(event);
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		//The initial state
		if (activeId === cdcl_stateName2StateId.unary_empty_clause_detection_state) {
			initialTransition();
		}
		//Waiting to enter or not the clause analysis
		else if (activeId === cdcl_stateName2StateId.traversed_occurrences_state) {
			conflictDetectionBlock();
		}
		//Waiting to decide a variables
		else if (activeId === cdcl_stateName2StateId.decide_state) {
			decide();
		}
		// Waiting to begin the conflict analysis process once a conflict has been found
		else if (activeId === cdcl_stateName2StateId.wipe_occurrences_queue_state) {
			preConflictAnalysis();
		}
		// Waiting to analyze a conflict
		else if (activeId === cdcl_stateName2StateId.virtual_resolution_state) {
			conflictAnalysisBlock();
		}
	}

	protected async traverseCurrentOccurrenceListStepByStep(): Promise<void> {
		// To traverse the whole list, there are 2 different things that can happen:
		//	1. If a conflict has been found, the machine should wait for the user to notice this error.
		//	2. If the occurrence list has been analyzed, then we should upload the following occurrence list form the queue or go to the decision state.

		// Get the current occurrence list
		const occurrences: VisitingOccurrenceList = getCurrentOccurrences();

		// Either traverse it or find a conflict.
		const unwrappedOccurrences = unwrapEither(occurrences)
		await this.automaticStepByStep(
			() => !unwrappedOccurrences.traversed() && !this.onConflictState()
		);

		// If there is no conflict, then we need to do an extra step for either uploading the following occurrence list or continue to the decision state.
		// Because of this, an extra step should be done.
		if (!this.onConflictState()) {
			this.step();
		}
	}

	protected async solveCDStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => this.onDetectingConflict());
	}

	protected async solveCAStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => !getConflictAnalysis().finished());
	}

	protected async unitPropagate(): Promise<void> {
		const previousUPs: number = getNoUnitPropagations(); // This is monotonically increasing
		await this.automaticStepByStep(
			() => previousUPs == getNoUnitPropagations() && this.onDetectingConflict()
		);
	}

	onDetectingConflict(): boolean {
		const queueOccurrences: Queue<VisitingOccurrenceList> = getOccurrenceListQueue();
		return !queueOccurrences.isEmpty() && !this.stateMachine.onConflictState();
	}
}
