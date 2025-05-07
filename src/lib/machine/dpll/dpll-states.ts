import { addState, type NonFinalState, type State } from '../state.ts';
import {
	conflictDetection,
	unitClauseDetection,
	type CD_STATE_INPUT,
	type DPLL_ALGORITHM,
	type DPLL_CD,
	type DPLL_UCD,
	type UCD_STATE_INPUT
} from './dpll-domain.ts';

const ucd_state: NonFinalState<UCD_STATE_INPUT, DPLL_UCD> = {
	algorithm: unitClauseDetection,
	neighbor: new Map()
};

const cd_state: NonFinalState<CD_STATE_INPUT, DPLL_CD> = {
	algorithm: conflictDetection,
	neighbor: new Map().set('ucd', ucd_state)
};

export const makeMachine = (): Map<number, State<DPLL_ALGORITHM>> => {
	let states = addState(cd_state);
	states = addState(ucd_state);
	return states;
};
