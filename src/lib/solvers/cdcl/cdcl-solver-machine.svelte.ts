import { updateClausesToCheck } from '$lib/states/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
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
import { type StateMachineEvent } from '$lib/events/events.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { ConflictAnalysis, OccurrenceList } from '../types.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type Clause from '$lib/entities/Clause.svelte.ts';
import { assertiveness } from '$lib/algorithms/assertive.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine();
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	// Queue that will contain all those Set of clauses that need to be checked.
	pendingOccurrenceLists: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());
	// This variable contains all the information for the machine to find the firstUIP.
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor() {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl');
		this.pendingOccurrenceLists = new Queue<OccurrenceList>();
	}

	// ** functions related to pendingConflicts **
	postpone(pendingConflict: OccurrenceList): void {
		this.pendingOccurrenceLists.enqueue(pendingConflict);
	}

	resolvePostponed(): OccurrenceList | undefined {
		return this.pendingOccurrenceLists.dequeue();
	}

	consultPostponed(): OccurrenceList {
		return this.pendingOccurrenceLists.pick();
	}

	thereArePostponed(): boolean {
		return !this.pendingOccurrenceLists.isEmpty();
	}

	leftToPostpone(): number {
		return this.pendingOccurrenceLists.size();
	}

	getQueue(): Queue<OccurrenceList> {
		const returnQueue: Queue<OccurrenceList> = new Queue();
		for (const originalItem of this.pendingOccurrenceLists.toArray()) {
			const copiedSet = new SvelteSet<number>(originalItem.clauses);
			const copiedItem: OccurrenceList = {
				clauses: copiedSet,
				variableReasonId: originalItem.variableReasonId
			};
			returnQueue.enqueue(copiedItem);
		}
		return returnQueue;
	}

	// ** functions related to conflict analysis **

	setConflictAnalysis(
		trail: Trail,
		conflictClause: Clause,
		decisionLevelVariables: number[]
	): void {
		this.conflictAnalysis = { trail, conflictClause, decisionLevelVariables };
	}

	updateConflictClause(conflictClause: Clause): void {
		if (!this.conflictAnalysis) {
			logFatal(
				'Not possible to update the Conflict Clause',
				'There is no Conflict Clause to update as there is no Conflict Analysis structure built'
			);
		}
		this.conflictAnalysis.conflictClause = conflictClause;
	}

	consultConflictAnalysis(): ConflictAnalysis | undefined {
		return this.conflictAnalysis;
	}

	isAssertive() {
		if (this.conflictAnalysis === undefined) {
			logFatal('Assertive exception', 'The conflict analysis can not be undefined');
		}
		const { conflictClause, decisionLevelVariables } = this.conflictAnalysis;
		return assertiveness(conflictClause, decisionLevelVariables);
	}

	// ** general functions **

	getRecord(): Record<string, unknown> {
		return {
			queue: this.getQueue(),
			conflictAnalysis: this.conflictAnalysis
		};
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pendingOccurrenceLists = new Queue();
			updateClausesToCheck(new SvelteSet<number>(), -1);
			return;
		}
		const recordedPendingConflicts = record['queue'] as Queue<OccurrenceList>;
		this.pendingOccurrenceLists.clear();
		for (const pendingConflict of recordedPendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(pendingConflict.clauses);
			const copiedItem: OccurrenceList = {
				clauses: copiedSet,
				variableReasonId: pendingConflict.variableReasonId
			};
			this.pendingOccurrenceLists.enqueue(copiedItem);
		}
		if (!this.pendingOccurrenceLists.isEmpty()) {
			const conflict: OccurrenceList = this.pendingOccurrenceLists.pick();
			updateClausesToCheck(conflict.clauses, conflict.variableReasonId);
		} else {
			updateClausesToCheck(new SvelteSet<number>(), -1);
		}
	}

	async transition(input: StateMachineEvent): Promise<void> {
		if (input === 'finishCA') {
			await this.solveCAStepByStep();
		} else super.transition(input);
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
		const postponedClauses: Set<number> = this.consultPostponed().clauses;
		this.stepByStep(() => postponedClauses.size !== 0);
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.stepByStep(() => !this.pendingOccurrenceLists.isEmpty());
	}

	protected async solveCAStepByStep(): Promise<void> {
		this.stepByStep(() => !this.isAssertive());
	}

	onConflictDetection(): boolean {
		return !this.pendingOccurrenceLists.isEmpty() && !this.stateMachine.onConflictState();
	}
}
