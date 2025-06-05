import { Queue } from '$lib/transversal/entities/Queue.svelte.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { SolverMachine, type PendingItem } from '../SolverMachine.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import { makeDPLLMachine } from './dpll-state-machine.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition
} from './dpll-solver-transitions.svelte.ts';
import { dpll_stateName2StateId } from './dpll-states.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import { tick } from 'svelte';
import { getStepDelay } from '$lib/store/delay-ms.svelte.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pending: Queue<PendingItem> = $state(new Queue<PendingItem>());

	constructor() {
		super(makeDPLLMachine());
		this.pending = new Queue<PendingItem>();
	}

	postpone(pendingItem: PendingItem): void {
		this.pending.enqueue(pendingItem);
	}

	resolvePostponed(): PendingItem | undefined {
		return this.pending.dequeue();
	}

	consultPostponed(): PendingItem {
		return this.pending.pick();
	}

	thereArePostponed(): boolean {
		return !this.pending.isEmpty();
	}

	leftToPostpone(): number {
		return this.pending.size();
	}

	getQueue(): Queue<PendingItem> {
		const returnQueue: Queue<PendingItem> = new Queue();
		for (const originalItem of this.pending.toArray()) {
			const copiedSet = new SvelteSet<number>(originalItem.clauseSet);
			const copiedItem: PendingItem = { clauseSet: copiedSet, variable: originalItem.variable };
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
			this.pending = new Queue();
			updateClausesToCheck(new SvelteSet<number>(), -1);
			return;
		}
		const pendingItems = record['queue'] as Queue<PendingItem>;
		this.pending.clear();
		for (const pending of pendingItems.toArray()) {
			const copiedSet = new SvelteSet<number>(pending.clauseSet);
			const copiedItem: PendingItem = { clauseSet: copiedSet, variable: pending.variable };
			this.pending.enqueue(copiedItem);
		}
		if (!this.pending.isEmpty()) {
			const item: PendingItem = this.pending.pick();
			updateClausesToCheck(item.clauseSet, item.variable);
		}
	}

	async transition(input: StateMachineEvent): Promise<void> {
		//If receive a step, the state machine can be waiting in 4 possible states
		if (input === 'step') {
			this.step();
		} else if (input === 'nextVariable') {
			await this.solveToNextVariableStepByStep();
		} else if (input === 'finishUP') {
			await this.solveUPStepByStep();
		} else if (input === 'solve_trail') {
			await this.solveTrailStepByStep();
		} else if (input === 'solve_all') {
			await this.solveAllStepByStep();
		} else {
			logFatal('Non expected input for DPLL Solver State Machine');
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();

		//The initial state
		if (activeId === dpll_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waiting to analyze the next clause of the clauses to revise
		else if (activeId === dpll_stateName2StateId.next_clause_state) {
			analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.backtracking_state) {
			backtracking(this);
		}
	}

	private async solveToNextVariableStepByStep(): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		const postponedClauses: Set<number> = this.consultPostponed().clauseSet;
		while (postponedClauses.size !== 0 && !this.forcedStop) {
			this.step();
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	private async solveUPStepByStep(): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		while (!this.pending.isEmpty() && !this.forcedStop) {
			this.step();
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	detectingConflict(): boolean {
		return !this.pending.isEmpty();
	}
}
