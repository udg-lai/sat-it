import {
	BACKTRACKING_STATE_ID,
	DECIDE_STATE_ID,
	SAT_STATE_ID,
	UNSAT_STATE_ID
} from '../reserved.ts';
import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import {
	allAssigned,
	decide,
	emptyClauseDetection,
	type BKT_ALL_VARIABLES_ASSIGNED_FUN,
	type BKT_ALL_VARIABLES_ASSIGNED_INPUT,
	type BKT_DECIDE_FUN,
	type BKT_DECIDE_INPUT,
	type BKT_EMPTY_CLAUSE_FUN,
	type BKT_EMPTY_CLAUSE_INPUT,
	type BKT_FUN,
	type BKT_INPUT
} from './bkt-domain.ts';

export const bkt_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	bkt_state: BACKTRACKING_STATE_ID,
	empty_clause_state: 0,
	all_variables_assigned_state: 1,
	complementary_occurrences_state: 2
};

// ** define state nodes **

const unsat_state: FinalState<never> = {
	id: bkt_stateName2StateId['unsat_state'],
	description: 'UnSAT state'
};

const sat_state: FinalState<never> = {
	id: bkt_stateName2StateId['sat_state'],
	description: 'SAT state'
};

const empty_clause_state: NonFinalState<BKT_EMPTY_CLAUSE_FUN, BKT_EMPTY_CLAUSE_INPUT> = {
	id: bkt_stateName2StateId['empty_clause_state'],
	run: emptyClauseDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map<BKT_EMPTY_CLAUSE_INPUT, number>()
		.set('all_variables_assigned_state', bkt_stateName2StateId['all_variables_assigned_state'])
		.set('unsat_state', bkt_stateName2StateId['unsat_state'])
};

const all_variables_assigned_state: NonFinalState<
	BKT_ALL_VARIABLES_ASSIGNED_FUN,
	BKT_ALL_VARIABLES_ASSIGNED_INPUT
> = {
	id: bkt_stateName2StateId['all_variables_assigned_state'],
	description: 'Verify if all variables have been assigned',
	run: allAssigned,
	transitions: new Map<BKT_ALL_VARIABLES_ASSIGNED_INPUT, number>()
		.set('sat_state', bkt_stateName2StateId['sat_state'])
		.set('decide_state', bkt_stateName2StateId['decide_state'])
};

const decide_state: NonFinalState<BKT_DECIDE_FUN, BKT_DECIDE_INPUT> = {
	id: bkt_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<BKT_DECIDE_INPUT, number>().set(
		'complementary_occurrences_state',
		bkt_stateName2StateId['complementary_occurrences_state']
	)
};

export const states: Map<number, State<BKT_FUN, BKT_INPUT>> = new Map();

states.set(empty_clause_state.id, empty_clause_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(sat_state.id, sat_state);
states.set(unsat_state.id, unsat_state);

export const initial = empty_clause_state.id;
