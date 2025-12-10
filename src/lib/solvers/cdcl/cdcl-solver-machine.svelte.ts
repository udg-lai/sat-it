import { assertiveAlgorithm } from '$lib/algorithms/assertive.ts';
import type Clause from '$lib/entities/Clause.svelte.ts';
import { Queue } from '$lib/entities/Queue.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import { type StateMachineEvent } from '$lib/events/events.ts';
import {
	cleanClausesToCheck,
	updateClausesToCheck
} from '$lib/states/conflict-detection-state.svelte.ts';
import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
import { setInspectedVariable } from '$lib/states/inspectedVariable.svelte.ts';
import {
	forgetLearnedClauses,
	learnClauses,
	syncProblemWithTrail
} from '$lib/states/problem.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { ConflictAnalysis, OccurrenceList } from '../types.ts';
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
import { wrapLearnedClauses } from '$lib/states/trails.svelte.ts';
import type { Lit } from '$lib/types/types.ts';

export const makeCDCLSolver = (): CDCL_SolverMachine => {
	return new CDCL_SolverMachine(getStepDelay());
};

export class CDCL_SolverMachine extends SolverMachine<CDCL_FUN, CDCL_INPUT> {
	// Queue that will contain all those Set of clauses that need to be checked.
	pendingOccurrenceLists: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());
	// This variable contains all the information for the machine to find the firstUIP.
	conflictAnalysis: ConflictAnalysis | undefined = $state(undefined);

	constructor(stopTimeMS: number) {
		const stateMachine: CDCL_StateMachine = makeCDCLStateMachine();
		super(stateMachine, 'cdcl', stopTimeMS);
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
				literal: originalItem.literal
			};
			returnQueue.enqueue(copiedItem);
		}
		return returnQueue;
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
			queue: this.getQueue(),
			conflictAnalysis: this.inConflictAnalysis() ? this.getConflictAnalysis() : undefined
		};
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pendingOccurrenceLists = new Queue();
			cleanClausesToCheck();
			return;
		}
		const recordedPendingConflicts = record['queue'] as Queue<OccurrenceList>;
		this.pendingOccurrenceLists.clear();
		for (const pendingConflict of recordedPendingConflicts.toArray()) {
			const copiedSet = new SvelteSet<number>(pendingConflict.clauses);
			const copiedItem: OccurrenceList = {
				clauses: copiedSet,
				literal: pendingConflict.literal
			};
			this.pendingOccurrenceLists.enqueue(copiedItem);
		}
		if (!this.pendingOccurrenceLists.isEmpty()) {
			const { clauses, literal }: OccurrenceList = this.pendingOccurrenceLists.pick();
			updateClausesToCheck(clauses, literal);
		} else {
			cleanClausesToCheck();
		}
		const conflictAnalysis = record['conflictAnalysis'] as ConflictAnalysis;
		if (conflictAnalysis === undefined) {
			this.conflictAnalysis = undefined;
		} else {
			this.setConflictAnalysis(
				conflictAnalysis.trail.copy(),
				conflictAnalysis.conflictClause.copy(),
				[...conflictAnalysis.ldlAssignments]
			);
			// Forcing the problem to forget about the learned clauses
			forgetLearnedClauses();
			// Learning only those clauses that are currently in the trails
			learnClauses(wrapLearnedClauses());
			// Now we need to sync the problem with the trail.
			// Meaning that the variables need to be assigned as in the trail.
			// And the occurrences table needs to be rebuilt.
			syncProblemWithTrail(conflictAnalysis.trail);
			setInspectedVariable(conflictAnalysis.trail.last().toVar());
		}
	}

	async transitionByEvent(input: StateMachineEvent): Promise<void> {
		if (input === 'finishCA') {
			await this.solveCAStepByStep();
		} else super.transitionByEvent(input);
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
		const ccIsAssertive = () => {
			const { conflictClause, ldlAssignments } = this.getConflictAnalysis();
			return assertiveAlgorithm(conflictClause, ldlAssignments);
		};
		this.stepByStep(() => !ccIsAssertive());
	}

	onConflictDetection(): boolean {
		return !this.pendingOccurrenceLists.isEmpty() && !this.stateMachine.onConflictState();
	}
}
