import { type State, StateMachine } from '../StateMachine.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl-domain.svelte.ts';
import { conflict, initial, preConflict, sat, states, unsat } from './cdcl-states.svelte.ts';

export const makeCDCLStateMachine = (): CDCL_StateMachine => {
	return new CDCL_StateMachine(states, initial, preConflict, conflict, sat, unsat);
};

export class CDCL_StateMachine extends StateMachine<CDCL_FUN, CDCL_INPUT> {
	constructor(
		states: Map<number, State<CDCL_FUN, CDCL_INPUT>>,
		initial: number,
		preConflict: number,
		conflict: number,
		sat: number,
		unsat: number
	) {
		super(states, initial, preConflict, conflict, sat, unsat);
	}
}
