import type { NonFinalState, FinalState, State } from '../machine.svelte.ts';
import {
	conflictDetection,
	unitClauseDetection,
	type CD_STATE_INPUT,
	type DPLL_CD,
	type DPLL_STATE_INPUT,
	type DPLL_STATE_FUN,
	type DPLL_UCD,
	type UCD_STATE_INPUT
} from './dpll-domain.ts';

// define state nodes

const ucd_state: NonFinalState<DPLL_UCD, UCD_STATE_INPUT> = {
	id: 2,
	run: unitClauseDetection,
	transitions: new Map()
};

const cd_state: NonFinalState<DPLL_CD, CD_STATE_INPUT> = {
	id: 1,
	run: conflictDetection,
	transitions: new Map().set('ucd', 2)
};

// export state nodes

export const states: Map<number, State<DPLL_STATE_FUN, DPLL_STATE_INPUT>> = new Map();

states.set(cd_state.id, cd_state);
states.set(ucd_state.id, ucd_state);

// export initial node

export const initial = cd_state.id;
