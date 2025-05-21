import { initial, states } from './bkt-states.ts';
import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.ts';

export const makeBKTMachine = (): BKT_StateMachine => {
	return new BKT_StateMachine(states, initial);
};

export class BKT_StateMachine extends StateMachine<BKT_FUN, BKT_INPUT> {
	constructor(states: Map<number, State<BKT_FUN, BKT_INPUT>>, initial: number) {
		super(states, initial);
	}
}
