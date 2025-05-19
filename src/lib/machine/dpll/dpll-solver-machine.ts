import { Queue } from '$lib/transversal/entities/Queue.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { SolverMachine } from '../SolverMachine.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.ts';
import { makeDPLLMachine } from './dpll-state-machine.ts';
import {
	analizeClause,
	backtracking,
	decide,
	initialTransition
} from './dpll-solver-transitions.ts';
import { dpll_stateName2StateId } from './dpll-states.ts';

export const makeDPLLSolver = (): DPLL_SolverMachine => {
	return new DPLL_SolverMachine();
};

export class DPLL_SolverMachine extends SolverMachine<DPLL_FUN, DPLL_INPUT> {
	pending: Queue<Set<number>>;

	constructor() {
		super();
		this.stateMachine = makeDPLLMachine();
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

	leftToPostpone(): number {
		return this.pending.size();
	}

	transition(input: StateMachineEvent): void {
		//If recieve a step, the state machine can be waitting in 4 possible states
		if (input === 'step') {
			this.steplogic();
		} else if (input === 'followingVariable') {
			const currentSet: Set<number> = this.consultPostponed();
			while (currentSet.size !== 0) {
				analizeClause(this);
			}
		} else if (input === 'finishUP') {
			while (!this.pending.isEmpty()) {
				analizeClause(this);
			}
		} else if (input === 'solve_trail') {
			let activeId: number = this.stateMachine.active;
			while (
				activeId !== dpll_stateName2StateId.backtracking_state &&
				activeId !== dpll_stateName2StateId.sat_state &&
				activeId !== dpll_stateName2StateId.unsat_state
			) {
				this.steplogic();
				activeId = this.stateMachine.active;
			}
		} else if (input === 'solve_all') {
			let activeId: number = this.stateMachine.active;
			while (
				activeId !== dpll_stateName2StateId.sat_state &&
				activeId !== dpll_stateName2StateId.unsat_state
			) {
				this.steplogic();
				activeId = this.stateMachine.active;
			}
		} else {
			logFatal('Non expected input for DPLL Solver State Machine');
		}
	}
	steplogic(): void {
		const activeId: number = this.stateMachine.active;
		//The initial state
		if (activeId === dpll_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waitting to analize the next clause of the clauses to revise
		else if (activeId === dpll_stateName2StateId.next_clause_state) {
			analizeClause(this);
		}
		//Waitting to decide a variables
		else if (activeId === dpll_stateName2StateId.decide_state) {
			decide(this);
		}
		//Waitting to backtrack an assignment
		else if (activeId === dpll_stateName2StateId.backtracking_state) {
			backtracking(this);
		}
	}
}
