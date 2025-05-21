import { initial, states } from './bkt-states.ts';
import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.ts';

export const makeBacktrackingMachine = (): Backtracking_StateMachine => {
	return new Backtracking_StateMachine(states, initial);
};

export class Backtracking_StateMachine extends StateMachine<BKT_FUN, BKT_INPUT> {
	constructor(states: Map<number, State<BKT_FUN, BKT_INPUT>>, initial: number) {
		super(states, initial);
	}
}
