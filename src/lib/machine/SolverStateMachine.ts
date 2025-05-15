import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { makeBacktrackingMachine } from './backtracking/backtracking-machine.ts';
import { makeDPLLMachine } from './dpll/dpll-machine.ts';
import type { StateFun, StateInput, StateMachine } from './StateMachine.ts';

export interface SolverStateMachineInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	transition: (input: StateMachineEvent) => void;
}

export abstract class SolverStateMachine
	implements SolverStateMachineInterface<StateFun, StateInput>
{
	stateMachine: StateMachine<StateFun, StateInput>;

	constructor(type: 'backtracking' | 'dpll' | 'cdcl') {
		if (type === 'backtracking') {
			this.stateMachine = makeBacktrackingMachine();
		} else if (type === 'dpll') {
			this.stateMachine = makeDPLLMachine();
		} else {
			this.stateMachine = makeBacktrackingMachine();
		}
	}

	abstract transition(input: StateMachineEvent): void;
}
