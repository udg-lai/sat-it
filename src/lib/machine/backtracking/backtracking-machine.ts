import type { DPLL_FUN, DPLL_INPUT } from '../dpll/dpll-domain.ts';
import { initial, states } from '../dpll/dpll-states.ts';
import { type State, StateMachine } from '../StateMachine.ts';

export const makeBacktrackingMachine = (): Backtracking_StateMachine => {
	return new Backtracking_StateMachine(states, initial);
};

export class Backtracking_StateMachine extends StateMachine<DPLL_FUN, DPLL_INPUT> {
	constructor(states: Map<number, State<DPLL_FUN, DPLL_INPUT>>, initial: number) {
		super(states, initial);
	}
}
