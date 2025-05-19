import type { StateMachineEvent } from '$lib/transversal/events.ts';
import type { StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';

export interface SolverStateInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	transition: (input: StateMachineEvent) => void;
	getActiveStateId: () => number;
	updateActiveStateId: (id: number) => void;
}

export abstract class SolverMachine<F extends StateFun, I extends StateInput>
	implements SolverStateInterface<F, I>
{
	//With the exclamation mark, we assure that the stateMachine attribute will be assigned before its use
	stateMachine!: StateMachine<F, I>;

	abstract transition(input: StateMachineEvent): void;

	getActiveStateId(): number {
		return this.stateMachine.getActiveId();
	}

	updateActiveStateId(id: number): void {
		this.stateMachine.setActiveId(id);
	}
}
