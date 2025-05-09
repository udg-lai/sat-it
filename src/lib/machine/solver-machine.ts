import { makeBacktrackingMachine } from './backtracking/backtracking-machine.ts';
import type { DPLL_STATE_INPUT } from './dpll/dpll-domain.ts';
import { makeDPLLMachine } from './dpll/dpll-machine.ts';
import type { StateFun, StateInput, StateMachine } from './machine.svelte.ts';

export interface SolverMachineInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	pendingClauses: Set<number>[];
	transition: (input: I) => void;
	getPendingClauses: () => Set<number>[];
}

export class SolverMachine implements SolverMachineInterface<StateFun, StateInput> {
	stateMachine: StateMachine<StateFun, StateInput>;
	pendingClauses: Set<number>[];

	constructor(type: 'backtracking' | 'dpll' | 'cdcl') {
		if (type === 'backtracking') {
			this.stateMachine = makeBacktrackingMachine();
		} else if (type === 'dpll') {
			this.stateMachine = makeDPLLMachine();
		} else {
			this.stateMachine = makeBacktrackingMachine();
		}
		this.pendingClauses = [];
	}

	transition(input: DPLL_STATE_INPUT): void {
		this.stateMachine.transition(input);
	}

	getPendingClauses(): Set<number>[] {
		return this.pendingClauses;
	}
}
