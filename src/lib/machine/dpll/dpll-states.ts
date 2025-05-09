import type { NonFinalState, FinalState, State } from '../machine.svelte.ts';
import {
	unitClauseDetection,
	type EC_STATE_INPUT,
	type DPPL_EC,
	type DPLL_STATE_INPUT,
	type DPLL_STATE_FUN,
	type DPLL_UCD,
	type UCD_STATE_INPUT,
	emptyClayseDetection
} from './dpll-domain.ts';

// define state nodes

const ucd_state: NonFinalState<DPLL_UCD, UCD_STATE_INPUT> = {
	id: 2,
	run: unitClauseDetection,
	transitions: new Map()
};

// searchs the empty clause

const ec_state: NonFinalState<DPPL_EC, EC_STATE_INPUT> = {
	id: 1,
	run: emptyClayseDetection,
	transitions: new Map().set('ucd', 2)
};


// const cd_state: NonFinalState<DPLL_CD, EC_STATE_INPUT> = {
// 	id: 1,
// 	run: emptyClayseDetection,
// 	transitions: new Map().set('ucd', 2)
// };

// export state nodes

export const states: Map<number, State<DPLL_STATE_FUN, DPLL_STATE_INPUT>> = new Map();

states.set(ec_state.id, ec_state);
states.set(ucd_state.id, ucd_state);

// export initial node

export const initial = ec_state.id;
