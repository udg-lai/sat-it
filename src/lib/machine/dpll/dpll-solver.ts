import { Queue } from '$lib/transversal/entities/Queue.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { SolverStateMachine } from '../SolverStateMachine.ts';
import { initialTransition } from './dpll-solver-transitions.ts';

export const makeDPLLSolver = (): DPLL_SolverStateMachine => {
	return new DPLL_SolverStateMachine('dpll');
};

export class DPLL_SolverStateMachine extends SolverStateMachine {
	pending: Queue<Set<number>>;

	constructor(type: 'dpll') {
		super(type);
		this.pending = new Queue();
	}

	postpone(clauses: Set<number>): void {
		this.pending.enqueue(clauses);
	}

	resolvePostponed(): Set<number> | undefined {
		return this.pending.dequeue();
	}

	consultPostponed(): Set<number> {
		return this.pending.peek();
	}

	thereArePostponed(): boolean {
		return !this.pending.isEmpty();
	}

	transition(input: StateMachineEvent): void {
		if (input === 'step') {
			initialTransition(this);
		} else if (input === 'solve_trail') {
            console.log("Empty block")
		} else if (input === 'solve_all') {
            console.log("Empty block")
		} else {
			logFatal('Non expected input for DPLL Solver State Machine');
		}
	}
}
