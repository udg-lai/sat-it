import { Queue } from '$lib/transversal/entities/Queue.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { makeBacktrackingMachine } from './backtracking/backtracking-machine.ts';
import type { DPLL_INPUT } from './dpll/dpll-domain.ts';
import { makeDPLLMachine } from './dpll/dpll-machine.ts';
import type { StateFun, StateInput, StateMachine } from './StateMachine.ts';

export interface SolverStateMachineInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	pending: Queue<Set<number>>;
	transition: (input: I) => void;
	postpone(clauses: Set<number>): void;
	consultPostponed(): Set<number>;
	resolvePostponed(): Set<number> | undefined;
	thereArePostponed(): boolean;
}

export class SolverStateMachine implements SolverStateMachineInterface<StateFun, StateInput> {
	stateMachine: StateMachine<StateFun, StateInput>;
	pending: Queue<Set<number>>;

	constructor(type: 'backtracking' | 'dpll' | 'cdcl') {
		if (type === 'backtracking') {
			this.stateMachine = makeBacktrackingMachine();
		} else if (type === 'dpll') {
			this.stateMachine = makeDPLLMachine();
		} else {
			this.stateMachine = makeBacktrackingMachine();
		}
		this.pending = new Queue();
	}

	transition(input: DPLL_INPUT): void {
		this.stateMachine.transition(input);
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
}
