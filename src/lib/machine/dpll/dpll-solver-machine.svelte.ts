import { Queue } from '$lib/transversal/entities/Queue.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { SolverMachine } from '../SolverMachine.svelte.ts';
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
import { updateClausesToCheck } from '$lib/store/clausesToCheck.svelte.ts';
import { tick } from 'svelte';
import { getStepDelay } from '$lib/store/parameters.svelte.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pending: Queue<SvelteSet<number>>;

	constructor() {
		super(makeDPLLMachine(), false);
		this.pending = new Queue();
	}

	postpone(clauses: SvelteSet<number>): void {
		this.pending.enqueue(clauses);
	}

	resolvePostponed(): SvelteSet<number> | undefined {
		return this.pending.dequeue();
	}

	consultPostponed(): SvelteSet<number> {
		return this.pending.peek();
	}

	thereArePostponed(): boolean {
		return !this.pending.isEmpty();
	}

	leftToPostpone(): number {
		return this.pending.size();
	}

	getQueue(): Queue<SvelteSet<number>> {
		const returnQueue: Queue<SvelteSet<number>> = new Queue();

		for (const originalSet of this.pending.toArray()) {
			const copiedSet = new SvelteSet<number>(originalSet);
			returnQueue.enqueue(copiedSet);
		}

		return returnQueue;
	}

	getRecord(): Record<string, unknown> {
		return {
			queue: this.getQueue()
		};
	}

	getFirstStateId(): number {
		return dpll_stateName2StateId['empty_clause_state'];
	}

	getBacktrackingStateId(): number {
		return dpll_stateName2StateId['backtracking_state'];
	}

	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pending = new Queue();
			updateClausesToCheck(new SvelteSet<number>());
			return;
		}
		const pendingClauses = record['queue'] as Queue<SvelteSet<number>>;
		this.pending.clear();
		for (const pending of pendingClauses.toArray()) {
			const copiedSet = new SvelteSet<number>(pending);
			this.pending.enqueue(copiedSet);
		}
		if (!this.pending.isEmpty()) updateClausesToCheck(this.pending.peek());
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
		const postponedClauses: Set<number> = this.consultPostponed();
		while (postponedClauses.size !== 0 && !this.forcedStop) {
			this.step();
			await tick();
			console.log('State machine activeId: ', this.stateMachine.getActiveId());
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
			console.log('State machine activeId: ', this.stateMachine.getActiveId());
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}
}
