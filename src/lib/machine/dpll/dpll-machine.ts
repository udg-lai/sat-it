import type { Machine, NonFinalState, State } from '../domain.svelte.ts';
import type { DPLL_ALGORITHM, DPLL_INPUT } from './dpll-domain.ts';
import { cd_state, ucd_state } from './dpll-states.ts';

export const makeDPLLMachine = (): Machine => {
	const states: Map<number, State<DPLL_ALGORITHM> | NonFinalState<DPLL_INPUT, DPLL_ALGORITHM>> =
		new Map();
	states.set(1, cd_state);
	states.set(2, ucd_state);
	return {
		states,
		active: 1
	};
};
