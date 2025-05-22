import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll-domain.svelte.ts';
import { conflict, initial, states } from './dpll-states.svelte.ts';

export const makeDPLLMachine = (): DPLL_StateMachine => {
	return new DPLL_StateMachine(states, initial);
};

export class DPLL_StateMachine extends StateMachine<DPLL_FUN, DPLL_INPUT> {
	constructor(states: Map<number, State<DPLL_FUN, DPLL_INPUT>>, initial: number) {
		super(states, initial, conflict);
	}
}
