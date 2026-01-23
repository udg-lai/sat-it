import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { TWATCH_FUN, TWATCH_INPUT } from './twatch-domain.svelte.ts';
import { conflict, decision, initial, sat, states, unsat } from './twatch-states.svelte.ts';

export const makeTWATCHStateMachine = (): TWATCH_StateMachine => {
	return new TWATCH_StateMachine(states, initial, conflict, sat, unsat, decision);
};

export class TWATCH_StateMachine extends StateMachine<TWATCH_FUN, TWATCH_INPUT> {
	constructor(
		states: Map<number, State<TWATCH_FUN, TWATCH_INPUT>>,
		initial: number,
		conflict: number,
		sat: number,
		unsat: number,
		decision: number
	) {
		super(states, initial, conflict, sat, unsat, decision);
	}
}
