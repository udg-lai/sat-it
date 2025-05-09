import type { NonFinalState, FinalState, State } from '../machine.svelte.ts';
import { INITIAL_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	unitClauseDetection,
	type EC_STATE_INPUT,
	type DPPL_EC,
	type DPLL_STATE_INPUT,
	type DPLL_STATE_FUN,
	type DPLL_UCD,
	type UCD_STATE_INPUT,
	emptyClauseDetection,
	type DPLL_PENDING_CLAUSES,
	type PENDING_CLAUSES_STATE_INPUT,
	nextPendingClause
} from './dpll-domain.ts';

const stateName2StateId = {
	ec_state: INITIAL_STATE_ID,
	ucd_state: 1,
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	pending_clauses_state: 2
};

// define state nodes

const unsat_state: FinalState<never> = {
	id: stateName2StateId['unsat_state'],
	description: 'UnSAT state'
};

const sat_state: FinalState<never> = {
	id: stateName2StateId['sat_state'],
	description: 'SAT state'
};

const pending_clauses_state: NonFinalState<DPLL_PENDING_CLAUSES, PENDING_CLAUSES_STATE_INPUT> = {
	id: stateName2StateId['pending_clauses_state'],
	description: 'Check if there is no more pending set of clausules to visit',
	run: nextPendingClause,
	transitions: new Map()
};

// find unit clauses

const ucd_state: NonFinalState<DPLL_UCD, UCD_STATE_INPUT> = {
	id: stateName2StateId['ucd_state'],
	run: unitClauseDetection,
	description: 'Seeks for unit clause from the clause pool',
	transitions: new Map().set('pendingClauses', stateName2StateId['pending_clauses_state'])
};

// searchs the empty clause

const ec_state: NonFinalState<DPPL_EC, EC_STATE_INPUT> = {
	id: stateName2StateId['ec_state'],
	run: emptyClauseDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map()
		.set('ucd', stateName2StateId['ucd_state'])
		.set('unsat', stateName2StateId['unsat_state'])
};

export const states: Map<number, State<DPLL_STATE_FUN, DPLL_STATE_INPUT>> = new Map();

states.set(ec_state.id, ec_state);
states.set(ucd_state.id, ucd_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(pending_clauses_state.id, pending_clauses_state);

// export initial node

export const initial = ec_state.id;
