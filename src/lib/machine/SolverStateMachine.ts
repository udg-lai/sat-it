import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { makeBacktrackingMachine } from './backtracking/backtracking-machine.ts';
import { makeDPLLMachine } from './dpll/dpll-machine.ts';
import type { StateFun, StateInput, StateMachine } from './StateMachine.ts';

export interface SolverStateMachineInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	transition: (input: StateMachineEvent) => void;
}

export abstract class SolverStateMachine<F extends StateFun, I extends StateInput>
	implements SolverStateMachineInterface<F, I>
{
	//With the exclamation mark, we assure that the stateMachine atribute will be assigned before its use
	stateMachine!: StateMachine<F, I>;
	
	abstract transition(input: StateMachineEvent): void;
}
