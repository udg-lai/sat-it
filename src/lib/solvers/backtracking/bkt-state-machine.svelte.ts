import { conflict, initial, preConflict, sat, states, unsat } from './bkt-states.svelte.ts';
import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';

export const makeBKTStateMachine = (): BKT_StateMachine => {
	return new BKT_StateMachine(states, initial, preConflict, conflict, sat, unsat);
};

export class BKT_StateMachine extends StateMachine<BKT_FUN, BKT_INPUT> {
	constructor(
		states: Map<number, State<BKT_FUN, BKT_INPUT>>,
		initial: number,
		preConflict: number,
		conflict: number,
		sat: number,
		unsat: number
	) {
		super(states, initial, preConflict, conflict, sat, unsat);
	}
}
