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

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pending: Queue<SvelteSet<number>>;

	constructor() {
		super();
		this.stateMachine = makeDPLLMachine();
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
			this.logicStep();
		} else if (input === 'followingVariable') {
			const currentSet: Set<number> = this.consultPostponed();
			while (currentSet.size !== 0) {
				analyzeClause(this);
			}
		} else if (input === 'finishUP') {
			while (!this.pending.isEmpty()) {
				analyzeClause(this);
			}
		} else if (input === 'solve_trail') {
			while (!this.onBacktrackingState() && !this.onFinalState()) {
				this.logicStep();
			}
		} else if (input === 'solve_all') {
			await this.solveAllStepByStep();
		} else {
			logFatal('Non expected input for DPLL Solver State Machine');
		}
	}

	logicStep(): void {
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

	private async solveAllStepByStep(): Promise<void> {
		const times: number[] = [];
		while (!this.onFinalState()) {
			this.logicStep();
			await tick();
			console.log('State machine activeId: ', this.stateMachine.getActiveId());
			await new Promise((r) => times.push(setTimeout(r, 10)));
		}
		times.forEach(clearTimeout);
	}

	private onFinalState(): boolean {
		const activeId: number = this.stateMachine.getActiveId();
		return (
			activeId === dpll_stateName2StateId.sat_state ||
			activeId === dpll_stateName2StateId.unsat_state
		);
	}

	private onBacktrackingState(): boolean {
		const activeId: number = this.stateMachine.getActiveId();
		return activeId === dpll_stateName2StateId.backtracking_state;
	}
}
