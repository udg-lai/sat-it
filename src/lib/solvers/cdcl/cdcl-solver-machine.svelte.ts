import type OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import { type SolverCommand } from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
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
		if (activeId === cdcl_stateName2StateId.empty_clause_state) {
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
		else if (activeId === cdcl_stateName2StateId.wipe_occurrence_queue_state) {
			preConflictAnalysis();
		}
		// Waiting to analyze a conflict
		else if (activeId === cdcl_stateName2StateId.virtual_resolution_state) {
			conflictAnalysisBlock();
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const occurrences: OccurrenceList = getOccurrenceListQueue().element();
		await this.automaticStepByStep(() => !occurrences.traversed());
	}

	protected async solveCDStepByStep(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		await this.automaticStepByStep(() => !queueOccurrences.isEmpty());
	}

	protected async solveCAStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => !getConflictAnalysis().finished());
	}

	protected async unitPropagate(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		const previousUPs: number = getNoUnitPropagations(); // This is monotonically increasing
		await this.automaticStepByStep(
			() => previousUPs == getNoUnitPropagations() && !queueOccurrences.isEmpty()
		);
	}

	onDetectingConflict(): boolean {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		return !queueOccurrences.isEmpty() && !this.stateMachine.onConflictState();
	}
}
