import { assertiveAlgorithm } from '$lib/algorithms/assertive.ts';
import type Clause from '$lib/entities/Clause.svelte.ts';
import type OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import { type StateMachineEvent } from '$lib/events/events.ts';
import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import type { Lit } from '$lib/types/types.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { ConflictAnalysis } from '../types.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	analyzeClause,
	conflictAnalysis,
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
	// Queue that will contain all those Set of clauses that need to be checked.
	occurrencesQueue: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());
	// This variable contains all the information for the machine to find the firstUIP.
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor(stopTimeMS: number) {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl', stopTimeMS);
		this.occurrencesQueue = new Queue<OccurrenceList>();
	}

	// ** functions related to pendingConflicts **
	enqueueOccurrences(occurrences: OccurrenceList): void {
		this.occurrencesQueue.enqueue(occurrences);
	}

	dequeueOccurrences(): OccurrenceList | undefined {
		return this.occurrencesQueue.dequeue();
	}

	nextOccurrences(): OccurrenceList {
		return this.occurrencesQueue.element();
	}

	occurrenceQueueEmpty(): boolean {
		return this.occurrencesQueue.isEmpty();
	}

	occurrencesQueueSize(): number {
		return this.occurrencesQueue.size();
	}

	isOccurrencesQueueEmpty(): boolean {
		return this.occurrencesQueue.isEmpty();
	}

	// ** functions related to conflict analysis **

	setConflictAnalysis(trail: Trail, conflictClause: Clause, ldlAssignments: Lit[]): void {
		this.conflictAnalysis = { trail, conflictClause, ldlAssignments };
	}

	updateConflictClause(ccc: Clause): void {
		// This method updates the current Conflict Clause in the Conflict Analysis structure.
		if (!this.conflictAnalysis) {
			logFatal(
				'Not possible to update the Conflict Clause',
				'There is no Conflict Clause to update as there is no Conflict Analysis structure built'
			);
		}
		this.conflictAnalysis.conflictClause = ccc;
	}

	inConflictAnalysis(): boolean {
		return this.conflictAnalysis !== undefined;
	}

	consultConflictAnalysis(): ConflictAnalysis {
		if (!this.inConflictAnalysis()) {
			logFatal('Conflict Analysis exception', 'The conflict analysis can not be undefined');
		}
		return this.conflictAnalysis as ConflictAnalysis;
	}

	getConflictAnalysis(): ConflictAnalysis {
		if (!this.inConflictAnalysis()) {
			logError('Conflict Analysis exception', 'The conflict analysis can not be undefined');
		}
		const { trail, conflictClause, ldlAssignments } = this.conflictAnalysis as ConflictAnalysis;
		return {
			trail: trail.copy(),
			conflictClause: conflictClause.copy(),
			ldlAssignments: [...ldlAssignments]
		} as ConflictAnalysis;
	}

	getRecord(): Record<string, unknown> {
		return {
			queue: this.occurrenceQueueCopy(),
			conflictAnalysis: this.inConflictAnalysis() ? this.getConflictAnalysis() : undefined
		};
	}

	private occurrenceQueueCopy(): Queue<OccurrenceList> {
		const queue: Queue<OccurrenceList> = this.occurrencesQueue.copy();
		const newQueue: Queue<OccurrenceList> = new Queue<OccurrenceList>();

		while (!queue.isEmpty()) {
			const occurrenceList = queue.dequeue() as OccurrenceList;
			newQueue.enqueue(occurrenceList.copy());
		}

		return newQueue;
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
		else if (activeId === cdcl_stateName2StateId.all_clauses_checked_state) {
			preConflictDetection(this);
		}
		//Waiting to analyze the next clause of the clauses to revise
		else if (activeId === cdcl_stateName2StateId.delete_clause_state) {
			analyzeClause(this);
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
			conflictAnalysis(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const occurrenceList: OccurrenceList = this.nextOccurrences();
		this.stepByStep(() => !occurrenceList.traversed());
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.stepByStep(() => !this.occurrencesQueue.isEmpty());
	}

	protected async solveCAStepByStep(): Promise<void> {
		const ccIsAssertive = () => {
			const { conflictClause, ldlAssignments } = this.getConflictAnalysis();
			return assertiveAlgorithm(conflictClause, ldlAssignments);
		};
		this.stepByStep(() => !ccIsAssertive());
	}

	protected async unitPropagate(): Promise<void> {
		const previousUPs: number = getNoUnitPropagations(); // This is monotonically increasing
		this.stepByStep(
			() => previousUPs == getNoUnitPropagations() && !this.occurrenceQueueEmpty()
		);
	}

	onConflictDetection(): boolean {
		return !this.occurrencesQueue.isEmpty() && !this.stateMachine.onConflictState();
	}
}
