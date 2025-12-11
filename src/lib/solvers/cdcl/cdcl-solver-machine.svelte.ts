import type OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import { type StateMachineEvent } from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	decide,
	initialTransition,
	preConflictAnalysis,
	preConflictDetection
} from './cdcl-solver-transitions.svelte.ts';
import { CDCL_StateMachine, makeCDCLStateMachine } from './cdcl-state-machine.svelte.ts';
import { cdcl_stateName2StateId } from './cdcl-states.svelte.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine(getStepDelay());
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {

	constructor(stopTimeMS: number) {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl', stopTimeMS);
	}
	// ** functions related to conflict analysis **


	getRecord(): Record<string, unknown> {
		return undefined as unknown as Record<string, unknown>;
	}

	private occurrenceQueueCopy(): Queue<OccurrenceList> {
		return null as unknown as Queue<OccurrenceList>;
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {}

	async transitionByEvent(event: StateMachineEvent): Promise<void> {
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
			initialTransition(this);
		}
		//Waiting to enter or not the clause analysis
		else if (activeId === cdcl_stateName2StateId.traversed_occurrences_state) {
			preConflictDetection(this);
		}
		//Waiting to decide a variables
		else if (activeId === cdcl_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting after founding a conflict
		else if (activeId === cdcl_stateName2StateId.empty_clause_set_state) {
			preConflictAnalysis(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === cdcl_stateName2StateId.pick_last_assignment_state) {
			// conflictAnalysis(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const occurrences: OccurrenceList = getOccurrenceListQueue().element();
		this.stepByStep(() => !occurrences.traversed());
	}

	protected async solveCDStepByStep(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		this.stepByStep(() => !queueOccurrences.isEmpty());
	}

	protected async solveCAStepByStep(): Promise<void> {
		this.stepByStep(() => !getConflictAnalysis().finished());
	}

	protected async unitPropagate(): Promise<void> {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		const previousUPs: number = getNoUnitPropagations(); // This is monotonically increasing
		this.stepByStep(() => previousUPs == getNoUnitPropagations() && !queueOccurrences.isEmpty());
	}

	onConflictDetection(): boolean {
		const queueOccurrences: Queue<OccurrenceList> = getOccurrenceListQueue();
		return !queueOccurrences.isEmpty() && !this.stateMachine.onConflictState();
	}
}
