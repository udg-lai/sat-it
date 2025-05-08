import type { NonFinalState } from '../domain.svelte.ts';
import {
	conflictDetection,
	unitClauseDetection,
	type CD_STATE_INPUT,
	type DPLL_CD,
	type DPLL_UCD,
	type UCD_STATE_INPUT
} from './dpll-domain.ts';

export const ucd_state: NonFinalState<UCD_STATE_INPUT, DPLL_UCD> = {
	algorithm: unitClauseDetection,
	neighbor: new Map()
};

export const cd_state: NonFinalState<CD_STATE_INPUT, DPLL_CD> = {
	algorithm: conflictDetection,
	neighbor: new Map().set('ucd', ucd_state)
};
