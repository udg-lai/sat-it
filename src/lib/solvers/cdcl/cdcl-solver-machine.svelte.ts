import { setConflictAnalysisClause } from '$lib/states/clause-pool.svelte.ts';
import { updateClausesToCheck } from '$lib/states/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	analyzeClause,
	conflictAnalysis,
	decide,
	initialTransition,
	preConflictAnalysis
} from './cdcl-solver-transitions.svelte.ts';
import { CDCL_StateMachine, makeCDCLStateMachine } from './cdcl-state-machine.svelte.ts';
import { cdcl_stateName2StateId } from './cdcl-states.svelte.ts';
import { type StateMachineEvent } from '$lib/events/events.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { ConflictAnalysis, OccurrenceList } from '../types.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type TemporalClause from '$lib/entities/TemporalClause.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine();
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	// Queue that will contain all those Set of clauses that need to be checked.
	pendingConflicts: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());
	// This variable contains all the information for the machine to find the firstUIP.
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor() {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl');
		this.pendingConflicts = new Queue<OccurrenceList>();
	}

	// ** functions related to pendingConflicts **
	postpone(pendingConflict: OccurrenceList): void {
		this.pendingConflicts.enqueue(pendingConflict);
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

	// ** functions related to conflict analysis **

	setConflictAnalysis(
		trail: Trail,
		conflictClause: TemporalClause,
		decisionLevelVariables: number[]
	): void {
		this.conflictAnalysis = { trail, conflictClause, decisionLevelVariables };
		setConflictAnalysisClause(this.conflictAnalysis.conflictClause);
	}

	updateConflictClause(conflictClause: TemporalClause): void {
		if (!this.conflictAnalysis) {
			logFatal(
				'Not possible to update the Conflict Clause',
				'There is no Conflict Clause to update as there is no Conflict Analysis structure built'
			);
		}
		this.conflictAnalysis.conflictClause = conflictClause;
		setConflictAnalysisClause(this.conflictAnalysis.conflictClause);
	}

	consultConflictAnalysis(): ConflictAnalysis | undefined {
		return this.conflictAnalysis;
	}

	isAssertive() {
		if (this.conflictAnalysis === undefined) return false;

		const variables: number[] = this.conflictAnalysis.decisionLevelVariables;
		const conflictClause: TemporalClause = this.conflictAnalysis.conflictClause;

		let variablesFound: number = 0;
		let i: number = 0;
		while (i < variables.length && variablesFound < 2) {
			if (conflictClause.containsVariable(variables[i])) {
				variablesFound += 1;
			}
			i += 1;
		}
		if (variablesFound === 0) {
			logFatal(
				'Not possible result',
				'There must be at least one variable inside the conflict clause'
			);
		}
		return variablesFound === 1;
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
		this.stepByStep(() => !this.pendingConflicts.isEmpty());
	}

	protected async solveCAStepByStep(): Promise<void> {
		this.stepByStep(() => !this.isAssertive());
	}

	onConflictDetection(): boolean {
		return !this.pendingConflicts.isEmpty() && !this.stateMachine.onConflictState();
	}
}
