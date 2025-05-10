import { type State, StateMachine } from '../StateMachine.ts';
import type { DPLL_STATE_FUN, DPLL_STATE_INPUT } from './dpll-domain.ts';
import { initial, states } from './dpll-states.ts';

export const makeDPLLMachine = (): DPLL_StateMachine => {
	return new DPLL_StateMachine(states, initial);
};

export class DPLL_StateMachine extends StateMachine<DPLL_STATE_FUN, DPLL_STATE_INPUT> {
	constructor(states: Map<number, State<DPLL_STATE_FUN, DPLL_STATE_INPUT>>, initial: number) {
		super(states, initial);
	}
}
