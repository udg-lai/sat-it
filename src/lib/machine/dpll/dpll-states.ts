import type { NonFinalState, FinalState, State } from '../StateMachine.ts';
import { INITIAL_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	unitClauseDetection,
	type DPLL_EC_INPUT,
	type DPPL_EC_FUN,
	type DPLL_STATE_INPUT,
	type DPLL_STATE_FUN,
	type DPLL_UCD_FUN,
	type DPLL_UCD_INPUT,
	emptyClauseDetection,
	type DPLL_PENDING_CLAUSES_FUN,
	type DPLL_PENDING_CLAUSES_INPUT,
	nextPendingClause,
	type DPLL_OBTAIN_PENDING_CLAUSE_FUN,
	type DPLL_OBTAIN_PENDING_CLAUSE_INPUT,
	obtainPendingClause
} from './dpll-domain.ts';

const stateName2StateId = {
	ec_state: INITIAL_STATE_ID,
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	ucd_state: 1,
	pending_clauses_state: 2,
	obtain_pending_clause_state: 3,
};

// *** define state nodes ***
const unsat_state: FinalState<never> = {
	id: stateName2StateId['unsat_state'],
	description: 'UnSAT state'
};

const sat_state: FinalState<never> = {
	id: stateName2StateId['sat_state'],
	description: 'SAT state'
};

const obtain_pending_clause_state: NonFinalState<DPLL_OBTAIN_PENDING_CLAUSE_FUN, DPLL_OBTAIN_PENDING_CLAUSE_INPUT> = {
	id: stateName2StateId['obtain_pending_clause_state'],
	description: 'Get next pending close to check',
	run: obtainPendingClause,
	transitions: new Map()
};

const pending_clauses_state: NonFinalState<DPLL_PENDING_CLAUSES_FUN, DPLL_PENDING_CLAUSES_INPUT> = {
	id: stateName2StateId['pending_clauses_state'],
	description: 'Check if there is no more pending set of clausules to visit',
	run: nextPendingClause,
	transitions: new Map<DPLL_PENDING_CLAUSES_INPUT, number>().set('obtain_pending_clause_state', obtain_pending_clause_state.id)
};

const ucd_state: NonFinalState<DPLL_UCD_FUN, DPLL_UCD_INPUT> = {
	id: stateName2StateId['ucd_state'],
	run: unitClauseDetection,
	description: 'Seeks for unit clause from the clause pool',
	transitions: new Map<DPLL_UCD_INPUT, number>().set('pending_clauses_state', pending_clauses_state.id)
};

const ec_state: NonFinalState<DPPL_EC_FUN, DPLL_EC_INPUT> = {
	id: stateName2StateId['ec_state'],
	run: emptyClauseDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map<DPLL_EC_INPUT, number>()
		.set('ucd_state', ucd_state.id)
		.set('unsat_state', unsat_state.id)
};

// *** adding states to the set of states ***
export const states: Map<number, State<DPLL_STATE_FUN, DPLL_STATE_INPUT>> = new Map();

states.set(ec_state.id, ec_state);
states.set(ucd_state.id, ucd_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(pending_clauses_state.id, pending_clauses_state);

// export initial node
export const initial = ec_state.id;
