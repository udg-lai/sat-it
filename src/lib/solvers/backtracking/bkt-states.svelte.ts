import {
	BACKTRACKING_STATE_ID,
	DECIDE_STATE_ID,
	SAT_STATE_ID,
	UNSAT_STATE_ID
} from '../reserved.ts';
import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import {
	allAssigned,
	backtracking,
	complementaryOccurrences,
	decide,
	dequeueOccurrenceList,
	emptyClausesDetection,
	nextClause,
	nonDecisionMade,
	queueOccurrenceList,
	traversedOccurrenceList,
	unsatisfiedClause,
	type BKT_ALL_VARIABLES_ASSIGNED_FUN,
	type BKT_ALL_VARIABLES_ASSIGNED_INPUT,
	type BKT_AT_LEVEL_ZERO_FUN,
	type BKT_AT_LEVEL_ZERO_INPUT,
	type BKT_BACKTRACKING_FUN,
	type BKT_BACKTRACKING_INPUT,
	type BKT_COMPLEMENTARY_OCCURRENCES_FUN,
	type BKT_COMPLEMENTARY_OCCURRENCES_INPUT,
	type BKT_CONFLICT_DETECTION_FUN,
	type BKT_CONFLICT_DETECTION_INPUT,
	type BKT_DECIDE_FUN,
	type BKT_DECIDE_INPUT,
	type BKT_DEQUEUE_OCCURRENCE_LIST_FUN,
	type BKT_DEQUEUE_OCCURRENCE_LIST_INPUT,
	type BKT_EMPTY_CLAUSES_DETECTION_FUN,
	type BKT_EMPTY_CLAUSES_DETECTION_INPUT,
	type BKT_FUN,
	type BKT_INPUT,
	type BKT_NEXT_OCCURRENCE_FUN,
	type BKT_NEXT_OCCURRENCE_INPUT,
	type BKT_QUEUE_OCCURRENCE_LIST_FUN,
	type BKT_QUEUE_OCCURRENCE_LIST_INPUT,
	type BKT_TRAVERSED_OCCURRENCE_LIST_FUN,
	type BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
} from './bkt-domain.svelte.ts';

export const bkt_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	backtracking_state: BACKTRACKING_STATE_ID,
	empty_clause_state: 0,
	all_variables_assigned_state: 1,
	complementary_occurrences_state: 2,
	queue_occurrence_list_state: 3,
	traversed_occurrences_state: 4,
	next_clause_state: 5,
	falsified_clause_state: 6,
	at_level_zero_state: 7,
	dequeue_occurrence_list_state: 8
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

const empty_clause_state: NonFinalState<
	BKT_EMPTY_CLAUSES_DETECTION_FUN,
	BKT_EMPTY_CLAUSES_DETECTION_INPUT
> = {
	id: bkt_stateName2StateId['empty_clause_state'],
	run: emptyClausesDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map<BKT_EMPTY_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrence_list_state',
		bkt_stateName2StateId['queue_occurrence_list_state']
	)
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
		'queue_occurrence_list_state',
		bkt_stateName2StateId['queue_occurrence_list_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	BKT_QUEUE_OCCURRENCE_LIST_FUN,
	BKT_QUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: bkt_stateName2StateId['queue_occurrence_list_state'],
	run: queueOccurrenceList,
	description: 'Stack an occurrence list as pending',
	transitions: new Map<BKT_QUEUE_OCCURRENCE_LIST_INPUT, number>().set(
		'traversed_occurrences_state',
		bkt_stateName2StateId['traversed_occurrences_state']
	)
};

const all_clauses_checked_state: NonFinalState<
	BKT_TRAVERSED_OCCURRENCE_LIST_FUN,
	BKT_TRAVERSED_OCCURRENCE_LIST_INPUT
> = {
	id: bkt_stateName2StateId['traversed_occurrences_state'],
	description:
		'True if the postponed set of clauses still contain clauses to check, otherwise false',
	run: traversedOccurrenceList,
	transitions: new Map<BKT_TRAVERSED_OCCURRENCE_LIST_INPUT, number>()
		.set('next_clause_state', bkt_stateName2StateId['next_clause_state'])
		.set('dequeue_occurrence_list_state', bkt_stateName2StateId['dequeue_occurrence_list_state'])
};

const next_clause_state: NonFinalState<BKT_NEXT_OCCURRENCE_FUN, BKT_NEXT_OCCURRENCE_INPUT> = {
	id: bkt_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause to deal with',
	run: nextClause,
	transitions: new Map<BKT_NEXT_OCCURRENCE_INPUT, number>().set(
		'falsified_clause_state',
		bkt_stateName2StateId['falsified_clause_state']
	)
};

const falsified_clause_state: NonFinalState<
	BKT_CONFLICT_DETECTION_FUN,
	BKT_CONFLICT_DETECTION_INPUT
> = {
	id: bkt_stateName2StateId['falsified_clause_state'],
	run: unsatisfiedClause,
	description: 'Check if current clause is unsatisfied',
	transitions: new Map<BKT_CONFLICT_DETECTION_INPUT, number>()
		.set('traversed_occurrences_state', bkt_stateName2StateId['traversed_occurrences_state'])
		.set('dequeue_occurrence_list_state', bkt_stateName2StateId['dequeue_occurrence_list_state'])
};

const dequeue_occurrence_list_state: NonFinalState<
	BKT_DEQUEUE_OCCURRENCE_LIST_FUN,
	BKT_DEQUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: bkt_stateName2StateId['dequeue_occurrence_list_state'],
	run: dequeueOccurrenceList,
	description: `Dequeues the analyzed occurrence list`,
	transitions: new Map<BKT_DEQUEUE_OCCURRENCE_LIST_INPUT, number>()
		.set('all_variables_assigned_state', bkt_stateName2StateId['all_variables_assigned_state'])
		.set('at_level_zero_state', bkt_stateName2StateId['at_level_zero_state'])
};

const at_level_zero_state: NonFinalState<BKT_AT_LEVEL_ZERO_FUN, BKT_AT_LEVEL_ZERO_INPUT> = {
	id: bkt_stateName2StateId['at_level_zero_state'],
	run: nonDecisionMade,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<BKT_AT_LEVEL_ZERO_INPUT, number>()
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
states.set(queue_occurrence_list_state.id, queue_occurrence_list_state);
states.set(falsified_clause_state.id, falsified_clause_state);
states.set(all_clauses_checked_state.id, all_clauses_checked_state);
states.set(next_clause_state.id, next_clause_state);
states.set(dequeue_occurrence_list_state.id, dequeue_occurrence_list_state);
states.set(at_level_zero_state.id, at_level_zero_state);
states.set(sat_state.id, sat_state);
states.set(unsat_state.id, unsat_state);
states.set(backtracking_state.id, backtracking_state);

export const initial = empty_clause_state.id;

export const decision = decide_state.id;

export const conflict = dequeue_occurrence_list_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;
