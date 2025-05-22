import {
	BACKTRACKING_STATE_ID,
	DECIDE_STATE_ID,
	SAT_STATE_ID,
	UNSAT_STATE_ID
} from '../reserved.ts';
import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import {
	allAssigned,
	allClausesChecked,
	backtracking,
	complementaryOccurrences,
	decide,
	deleteClause,
	emptyClauseDetection,
	emptyClauseSet,
	nextClause,
	nonDecisionMade,
	queueClauseSet,
	triggeredClauses,
	unsatisfiedClause,
	type BKT_ALL_CLAUSES_CHECKED_FUN,
	type BKT_ALL_CLAUSES_CHECKED_INPUT,
	type BKT_ALL_VARIABLES_ASSIGNED_FUN,
	type BKT_ALL_VARIABLES_ASSIGNED_INPUT,
	type BKT_BACKTRACKING_FUN,
	type BKT_BACKTRACKING_INPUT,
	type BKT_COMPLEMENTARY_OCCURRENCES_FUN,
	type BKT_COMPLEMENTARY_OCCURRENCES_INPUT,
	type BKT_CONFLICT_DETECTION_FUN,
	type BKT_CONFLICT_DETECTION_INPUT,
	type BKT_DECIDE_FUN,
	type BKT_DECIDE_INPUT,
	type BKT_DECISION_LEVEL_FUN,
	type BKT_DECISION_LEVEL_INPUT,
	type BKT_DELETE_CLAUSE_FUN,
	type BKT_DELETE_CLAUSE_INPUT,
	type BKT_EMPTY_CLAUSE_FUN,
	type BKT_EMPTY_CLAUSE_INPUT,
	type BKT_EMPTY_CLAUSE_SET_FUN,
	type BKT_EMPTY_CLAUSE_SET_INPUT,
	type BKT_FUN,
	type BKT_INPUT,
	type BKT_NEXT_CLAUSE_FUN,
	type BKT_NEXT_CLAUSE_INPUT,
	type BKT_QUEUE_CLAUSE_SET_FUN,
	type BKT_QUEUE_CLAUSE_SET_INPUT,
	type BKT_TRIGGERED_CLAUSES_FUN,
	type BKT_TRIGGERED_CLAUSES_INPUT
} from './bkt-domain.svelte.ts';

export const bkt_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	backtracking_state: BACKTRACKING_STATE_ID,
	empty_clause_state: 0,
	all_variables_assigned_state: 1,
	complementary_occurrences_state: 2,
	triggered_clauses_state: 3,
	queue_clause_set_state: 4,
	all_clauses_checked_state: 5,
	next_clause_state: 6,
	conflict_detection_state: 7,
	delete_clause_state: 8,
	empty_clause_set_state: 9,
	decision_level_state: 10
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

const complementary_occurrences_state: NonFinalState<
	BKT_COMPLEMENTARY_OCCURRENCES_FUN,
	BKT_COMPLEMENTARY_OCCURRENCES_INPUT
> = {
	id: bkt_stateName2StateId['complementary_occurrences_state'],
	run: complementaryOccurrences,
	description: 'Get the clauses where the complementary of the last assigned literal appear',
	transitions: new Map<BKT_COMPLEMENTARY_OCCURRENCES_INPUT, number>().set(
		'triggered_clauses_state',
		bkt_stateName2StateId['triggered_clauses_state']
	)
};

const triggered_clauses_state: NonFinalState<
	BKT_TRIGGERED_CLAUSES_FUN,
	BKT_TRIGGERED_CLAUSES_INPUT
> = {
	id: bkt_stateName2StateId['triggered_clauses_state'],
	run: triggeredClauses,
	description: 'Checks if last assignment added clauses to revise',
	transitions: new Map<BKT_TRIGGERED_CLAUSES_INPUT, number>()
		.set('queue_clause_set_state', bkt_stateName2StateId['queue_clause_set_state'])
		.set('all_variables_assigned_state', bkt_stateName2StateId['all_variables_assigned_state'])
};

const queue_clause_set_state: NonFinalState<BKT_QUEUE_CLAUSE_SET_FUN, BKT_QUEUE_CLAUSE_SET_INPUT> =
	{
		id: bkt_stateName2StateId['queue_clause_set_state'],
		run: queueClauseSet,
		description: 'Stack a set of clause as pending',
		transitions: new Map<BKT_QUEUE_CLAUSE_SET_INPUT, number>().set(
			'all_clauses_checked_state',
			bkt_stateName2StateId['all_clauses_checked_state']
		)
	};

const all_clauses_checked_state: NonFinalState<
	BKT_ALL_CLAUSES_CHECKED_FUN,
	BKT_ALL_CLAUSES_CHECKED_INPUT
> = {
	id: bkt_stateName2StateId['all_clauses_checked_state'],
	description:
		'True if the postponed set of clauses still contain clauses to check, otherwise false',
	run: allClausesChecked,
	transitions: new Map<BKT_ALL_CLAUSES_CHECKED_INPUT, number>()
		.set('next_clause_state', bkt_stateName2StateId['next_clause_state'])
		.set('all_variables_assigned_state', bkt_stateName2StateId['all_variables_assigned_state'])
};

const next_clause_state: NonFinalState<BKT_NEXT_CLAUSE_FUN, BKT_NEXT_CLAUSE_INPUT> = {
	id: bkt_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause to deal with',
	run: nextClause,
	transitions: new Map<BKT_NEXT_CLAUSE_INPUT, number>().set(
		'conflict_detection_state',
		bkt_stateName2StateId['conflict_detection_state']
	)
};

const conflict_detection_state: NonFinalState<
	BKT_CONFLICT_DETECTION_FUN,
	BKT_CONFLICT_DETECTION_INPUT
> = {
	id: bkt_stateName2StateId['conflict_detection_state'],
	run: unsatisfiedClause,
	description: 'Check if current clause is unsatisfied',
	transitions: new Map<BKT_CONFLICT_DETECTION_INPUT, number>()
		.set('delete_clause_state', bkt_stateName2StateId['delete_clause_state'])
		.set('empty_clause_set_state', bkt_stateName2StateId['empty_clause_set_state'])
};

const delete_clause_state: NonFinalState<BKT_DELETE_CLAUSE_FUN, BKT_DELETE_CLAUSE_INPUT> = {
	id: bkt_stateName2StateId['delete_clause_state'],
	run: deleteClause,
	description: `Deletes the clause that has been analyzed`,
	transitions: new Map<BKT_DELETE_CLAUSE_INPUT, number>().set(
		'all_clauses_checked_state',
		bkt_stateName2StateId['all_clauses_checked_state']
	)
};

const empty_clause_set_state: NonFinalState<BKT_EMPTY_CLAUSE_SET_FUN, BKT_EMPTY_CLAUSE_SET_INPUT> =
	{
		id: bkt_stateName2StateId['empty_clause_set_state'],
		run: emptyClauseSet,
		description: `Emties the queue of clauses to check`,
		transitions: new Map<BKT_EMPTY_CLAUSE_SET_INPUT, number>().set(
			'decision_level_state',
			bkt_stateName2StateId['decision_level_state']
		)
	};

const decision_level_state: NonFinalState<BKT_DECISION_LEVEL_FUN, BKT_DECISION_LEVEL_INPUT> = {
	id: bkt_stateName2StateId['decision_level_state'],
	run: nonDecisionMade,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<BKT_DECISION_LEVEL_INPUT, number>()
		.set('backtracking_state', bkt_stateName2StateId['backtracking_state'])
		.set('unsat_state', bkt_stateName2StateId['unsat_state'])
};

const backtracking_state: NonFinalState<BKT_BACKTRACKING_FUN, BKT_BACKTRACKING_INPUT> = {
	id: bkt_stateName2StateId['backtracking_state'],
	run: backtracking,
	description: `Executes a backtracking step`,
	transitions: new Map<BKT_BACKTRACKING_INPUT, number>().set(
		'complementary_occurrences_state',
		bkt_stateName2StateId['complementary_occurrences_state']
	)
};

export const states: Map<number, State<BKT_FUN, BKT_INPUT>> = new Map();

states.set(empty_clause_state.id, empty_clause_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(complementary_occurrences_state.id, complementary_occurrences_state);
states.set(triggered_clauses_state.id, triggered_clauses_state);
states.set(queue_clause_set_state.id, queue_clause_set_state);
states.set(conflict_detection_state.id, conflict_detection_state);
states.set(all_clauses_checked_state.id, all_clauses_checked_state);
states.set(next_clause_state.id, next_clause_state);
states.set(delete_clause_state.id, delete_clause_state);
states.set(empty_clause_set_state.id, empty_clause_set_state);
states.set(decision_level_state.id, decision_level_state);
states.set(sat_state.id, sat_state);
states.set(unsat_state.id, unsat_state);
states.set(backtracking_state.id, backtracking_state);

export const initial = empty_clause_state.id;

export const conflict = backtracking_state.id;
