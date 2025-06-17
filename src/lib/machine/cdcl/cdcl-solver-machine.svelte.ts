import { setConflictClause } from '$lib/store/clause-pool.svelte.ts';
import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { Queue } from '$lib/transversal/entities/Queue.svelte.ts';
import type TemporalClause from '$lib/transversal/entities/TemporalClause.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import {
	SolverMachine,
	type ConflictAnalysis,
	type ConflictDetection
} from '../SolverMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import {
	analyzeClause,
	conflictAnalysis,
	decide,
	initialTransition,
	preConflictAnalysis
} from './cdcl-solver-transitions.svelte.ts';
import { makeCDCLMachine } from './cdcl-state-machine.svelte.ts';
import { cdcl_stateName2StateId } from './cdcl-states.svelte.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { SvelteSet } from 'svelte/reactivity';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine();
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	// Queue that will contain all those Set of clauses that need to be checked.
	pendingConflicts: Queue<ConflictDetection> = $state(new Queue<ConflictDetection>());
	// This variable contains all the information for the machine to find the firstUIP.
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor() {
		super(makeCDCLMachine());
		this.pendingConflicts = new Queue<ConflictDetection>();
	}

	// ** functions related to pendingConflicts **
	postpone(pendingConflict: ConflictDetection): void {
		this.pendingConflicts.enqueue(pendingConflict);
	}

	resolvePostponed(): ConflictDetection | undefined {
		return this.pendingConflicts.dequeue();
	}

	consultPostponed(): ConflictDetection {
		return this.pendingConflicts.pick();
	}

	thereArePostponed(): boolean {
		return !this.pendingConflicts.isEmpty();
	}

	leftToPostpone(): number {
		return this.pendingConflicts.size();
	}

	getQueue(): Queue<ConflictDetection> {
		const returnQueue: Queue<ConflictDetection> = new Queue();
		for (const originalItem of this.pendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(originalItem.clauses);
			const copiedItem: ConflictDetection = {
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
		setConflictClause(this.conflictAnalysis.conflictClause);
	}

	updateConflictClause(conflictClause: TemporalClause): void {
		if (!this.conflictAnalysis) {
			logFatal(
				'Not possible to update the Conflict Clause',
				'There is no Conflict Clause to update as there is no Conflict Analysis structure built'
			);
		}
		this.conflictAnalysis.conflictClause = conflictClause;
		setConflictClause(this.conflictAnalysis.conflictClause);
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
		const recordedPendingConflicts = record['queue'] as Queue<ConflictDetection>;
		this.pendingConflicts.clear();
		for (const pendingConflict of recordedPendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(pendingConflict.clauses);
			const copiedItem: ConflictDetection = {
				clauses: copiedSet,
				variableReasonId: pendingConflict.variableReasonId
			};
			this.pendingConflicts.enqueue(copiedItem);
		}
		if (!this.pendingConflicts.isEmpty()) {
			const conflict: ConflictDetection = this.pendingConflicts.pick();
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
