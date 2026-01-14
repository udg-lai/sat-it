import { conflict, decision, initial, sat, states, unsat } from './bkt-states.svelte.ts';
import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';

export const makeBKTStateMachine = (): BKT_StateMachine => {
	return new BKT_StateMachine(states, initial, conflict, sat, unsat, decision);
};

export class BKT_StateMachine extends StateMachine<BKT_FUN, BKT_INPUT> {
	constructor(
		states: Map<number, State<BKT_FUN, BKT_INPUT>>,
		initial: number,
		conflict: number,
		sat: number,
		unsat: number,
		decision: number
	) {
		super(states, initial, conflict, sat, unsat, decision);
	}
}
