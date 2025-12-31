import { Queue } from '$lib/entities/Queue.svelte.ts';
import { updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import {
	analyzeClause,
	conflictiveState,
	decide,
	initialTransition,
	preConflictDetection
} from './dpll-solver-transitions.svelte.ts';
import { DPLL_StateMachine, makeDPLLMachine } from './dpll-state-machine.svelte.ts';
import { dpll_stateName2StateId } from './dpll-states.svelte.ts';
import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
import { getNoUnitPropagations } from '$lib/states/statistics.svelte.ts';
import type { StateMachineEvent } from '$lib/events/events.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine(getStepDelay());
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pendingOccurrenceLists: Queue<Occurrences> = $state(new Queue<Occurrences>());

	constructor(stopTimeMS: number) {
		const stateMachine: DPLL_StateMachine = makeDPLLMachine();
		super(stateMachine, 'dpll', stopTimeMS);
		this.pendingOccurrenceLists = new Queue<Occurrences>();
	}

	postpone(pendingItem: Occurrences): void {
		this.pendingOccurrenceLists.enqueue(pendingItem);
	}

	resolvePostponed(): Occurrences | undefined {
		return this.pendingOccurrenceLists.dequeue();
	}

	consultPostponed(): Occurrences {
		return this.pendingOccurrenceLists.element();
	}

	thereArePostponed(): boolean {
		return !this.pendingOccurrenceLists.isEmpty();
	}

	leftToPostpone(): number {
		return this.pendingOccurrenceLists.size();
	}

	getQueue(): Queue<Occurrences> {
		const returnQueue: Queue<Occurrences> = new Queue();
		for (const originalItem of this.pendingOccurrenceLists.toArray()) {
			const copiedSet = new SvelteSet<number>(originalItem.occ);
			const copiedItem: Occurrences = {
				occ: copiedSet,
				literal: originalItem.literal
			};
			returnQueue.enqueue(copiedItem);
		}
		return returnQueue;
	}

	getRecord(): Record<string, unknown> {
		return {
			queue: this.getQueue()
		};
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pendingOccurrenceLists = new Queue();
			cleanClausesToCheck();
			return;
		}
		const recordedPendingOccurrenceLists = record['queue'] as Queue<Occurrences>;
		this.pendingOccurrenceLists.clear();
		for (const pendingConflict of recordedPendingOccurrenceLists.toArray()) {
			const copiedSet = new SvelteSet<number>(pendingConflict.occ);
			const copiedItem: Occurrences = {
				occ: copiedSet,
				literal: pendingConflict.literal
			};
			this.pendingOccurrenceLists.enqueue(copiedItem);
		}
		if (!this.pendingOccurrenceLists.isEmpty()) {
			const { occ: clauses, literal }: Occurrences = this.pendingOccurrenceLists.element();
			updateOccurrenceList(clauses, literal);
		} else {
			cleanClausesToCheck();
		}
	}

	async transitionByEvent(input: StateMachineEvent): Promise<void> {
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
			initialTransition(this);
		}
		//Waiting to enter or not the clause analysis
		else if (activeId === dpll_stateName2StateId.all_clauses_checked_state) {
			preConflictDetection(this);
		}
		//Waiting to analyze the next clause or changing the clause set
		else if (activeId === dpll_stateName2StateId.delete_clause_state) {
			analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.empty_occurrence_lists_state) {
			conflictiveState(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		const postponedClauses: Set<number> = this.consultPostponed().occ;
		this.automaticStepByStep(() => postponedClauses.size !== 0);
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.automaticStepByStep(() => !this.pendingOccurrenceLists.isEmpty());
	}

	protected async unitPropagate(): Promise<void> {
		const previousUPs: number = getNoUnitPropagations();
		this.automaticStepByStep(
			() => previousUPs >= getNoUnitPropagations() && !this.pendingOccurrenceLists.isEmpty()
		);
	}

	onDetectingConflict(): boolean {
		return !this.pendingOccurrenceLists.isEmpty() && !this.onConflictState();
	}
}
