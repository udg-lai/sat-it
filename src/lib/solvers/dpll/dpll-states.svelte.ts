import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import {
	BACKTRACKING_STATE_ID,
	DECIDE_STATE_ID,
	SAT_STATE_ID,
	UNSAT_STATE_ID
} from '../reserved.ts';
import {
	allAssigned,
	atLevelZeroFun,
	backtracking,
	complementaryOccurrences,
	decide,
	nextClause,
	pendingOccurrenceList,
	pickPendingOccurrenceList,
	queueOccurrenceList,
	traversedOccurrenceList,
	unitClause,
	unitEmptyClauseDetection,
	unitPropagation,
	unsatisfiedClause,
	unstackOccurrenceList,
	wipeOccurrenceQueue,
	type DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	type DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	type DPLL_AT_LEVEL_ZERO_FUN,
	type DPLL_AT_LEVEL_ZERO_INPUT,
	type DPLL_BACKTRACKING_FUN,
	type DPLL_BACKTRACKING_INPUT,
	type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	type DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT,
	type DPLL_CONFLICT_DETECTION_FUN,
	type DPLL_CONFLICT_DETECTION_INPUT,
	type DPLL_DECIDE_FUN,
	type DPLL_DECIDE_INPUT,
	type DPLL_FUN,
	type DPLL_INPUT,
	type DPLL_NEXT_OCCURRENCE_FUN,
	type DPLL_NEXT_OCCURRENCE_INPUT,
	type DPLL_PICK_OCCURRENCE_LIST_FUN,
	type DPLL_PICK_OCCURRENCE_LIST_INPUT,
	type DPLL_QUEUE_OCCURRENCE_LIST_FUN,
	type DPLL_QUEUE_OCCURRENCE_LIST_INPUT,
	type DPLL_TRAVERSED_OCCURRENCE_LIST_FUN,
	type DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT,
	type DPLL_UNIT_CLAUSE_FUN,
	type DPLL_UNIT_CLAUSE_INPUT,
	type DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	type DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	type DPLL_UNIT_PROPAGATION_FUN,
	type DPLL_UNIT_PROPAGATION_INPUT,
	type DPLL_UNSTACK_CLAUSE_SET_INPUT,
	type DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
	type DPLL_WIPE_OCCURRENCE_QUEUE_FUN,
	type DPLL_WIPE_OCCURRENCE_QUEUE_INPUT
} from './dpll-domain.svelte.ts';

export const dpll_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	backtracking_state: BACKTRACKING_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	unary_empty_clauses_detection_state: 0,
	queue_occurrence_list_state: 1,
	are_remaining_occurrences_state: 2,
	pick_clause_set_state: 3,
	all_variables_assigned_state: 4,
	dequeue_occurrence_list_state: 5,
	clause_evaluation_state: 6,
	traversed_occurrences_state: 7,
	next_clause_state: 8,
	falsified_clause_state: 9,
	unit_clause_state: 10,
	unit_propagation_state: 11,
	complementary_occurrences_state: 12,
	at_level_zero_state: 13,
	wipe_occurrence_queue_state: 14
};

// *** define state nodes ***
const unsat_state: FinalState<never> = {
	id: dpll_stateName2StateId['unsat_state'],
	description: 'UnSAT state'
};

const sat_state: FinalState<never> = {
	id: dpll_stateName2StateId['sat_state'],
	description: 'SAT state'
};

const unary_empty_clauses_detection_state: NonFinalState<
	DPLL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
> = {
	id: dpll_stateName2StateId['unary_empty_clauses_detection_state'],
	run: unitEmptyClauseDetection,
	description: 'Seeks for the problem s unit clauses',
	transitions: new Map<DPLL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrence_list_state',
		dpll_stateName2StateId['queue_occurrence_list_state']
	)
};

const decide_state: NonFinalState<DPLL_DECIDE_FUN, DPLL_DECIDE_INPUT> = {
	id: dpll_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<DPLL_DECIDE_INPUT, number>().set(
		'complementary_occurrences_state',
		dpll_stateName2StateId['complementary_occurrences_state']
	)
};

const all_variables_assigned_state: NonFinalState<
	DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	DPLL_ALL_VARIABLES_ASSIGNED_INPUT
> = {
	id: dpll_stateName2StateId['all_variables_assigned_state'],
	description: 'Verify if all variables have been assigned',
	run: allAssigned,
	transitions: new Map<DPLL_ALL_VARIABLES_ASSIGNED_INPUT, number>()
		.set('sat_state', dpll_stateName2StateId['sat_state'])
		.set('decide_state', dpll_stateName2StateId['decide_state'])
};

const are_remaining_occurrences_state: NonFinalState<
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
> = {
	id: dpll_stateName2StateId['are_remaining_occurrences_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: pendingOccurrenceList,
	transitions: new Map<DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT, number>()
		.set('pick_occurrence_list_state', dpll_stateName2StateId['pick_clause_set_state'])
		.set('all_variables_assigned_state', dpll_stateName2StateId['all_variables_assigned_state'])
};

const pick_occurrence_list_state: NonFinalState<
	DPLL_PICK_OCCURRENCE_LIST_FUN,
	DPLL_PICK_OCCURRENCE_LIST_INPUT
> = {
	id: dpll_stateName2StateId['pick_clause_set_state'],
	description: 'Get next pending clause set from the queue',
	run: pickPendingOccurrenceList,
	transitions: new Map<DPLL_PICK_OCCURRENCE_LIST_INPUT, number>().set(
		'all_clauses_checked_state',
		dpll_stateName2StateId['traversed_occurrences_state']
	)
};

const occurrence_list_traversed_state: NonFinalState<
	DPLL_TRAVERSED_OCCURRENCE_LIST_FUN,
	DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT
> = {
	id: dpll_stateName2StateId['traversed_occurrences_state'],
	description: 'True if current occurrence list has been completely traversed, false otherwise',
	run: traversedOccurrenceList,
	transitions: new Map<DPLL_TRAVERSED_OCCURRENCE_LIST_INPUT, number>()
		.set('next_clause_state', dpll_stateName2StateId['next_clause_state'])
		.set('dequeue_occurrence_list_state', dpll_stateName2StateId['dequeue_occurrence_list_state'])
};

const next_clause_state: NonFinalState<DPLL_NEXT_OCCURRENCE_FUN, DPLL_NEXT_OCCURRENCE_INPUT> = {
	id: dpll_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause to deal with',
	run: nextClause,
	transitions: new Map<DPLL_NEXT_OCCURRENCE_INPUT, number>().set(
		'falsified_clause_state',
		dpll_stateName2StateId['falsified_clause_state']
	)
};

const falsified_clause_state: NonFinalState<
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT
> = {
	id: dpll_stateName2StateId['falsified_clause_state'],
	run: unsatisfiedClause,
	description: 'Check if the visiting clause has been falsified',
	transitions: new Map<DPLL_CONFLICT_DETECTION_INPUT, number>()
		.set('unit_clause_state', dpll_stateName2StateId['unit_clause_state'])
		.set('wipe_occurrence_queue_state', dpll_stateName2StateId['wipe_occurrence_queue_state'])
};

const unit_clause_state: NonFinalState<DPLL_UNIT_CLAUSE_FUN, DPLL_UNIT_CLAUSE_INPUT> = {
	id: dpll_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<DPLL_UNIT_CLAUSE_INPUT, number>()
		.set('traversed_occurrences_state', dpll_stateName2StateId['traversed_occurrences_state'])
		.set('unit_propagation_state', dpll_stateName2StateId['unit_propagation_state'])
};

const unit_propagation_state: NonFinalState<
	DPLL_UNIT_PROPAGATION_FUN,
	DPLL_UNIT_PROPAGATION_INPUT
> = {
	id: dpll_stateName2StateId['unit_propagation_state'],
	run: unitPropagation,
	description: 'Propagates the unassigned literal of a clause',
	transitions: new Map<DPLL_UNIT_PROPAGATION_INPUT, number>().set(
		'complementary_occurrences_state',
		dpll_stateName2StateId['complementary_occurrences_state']
	)
};

const complementary_occurrences_state: NonFinalState<
	DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
> = {
	id: dpll_stateName2StateId['complementary_occurrences_state'],
	run: complementaryOccurrences,
	description: 'Get the clauses where the complementary of the last assigned literal appear',
	transitions: new Map<DPLL_COMPLEMENTARY_OCCURRENCES_INPUT, number>().set(
		'queue_occurrence_list_state',
		dpll_stateName2StateId['queue_occurrence_list_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	DPLL_QUEUE_OCCURRENCE_LIST_FUN,
	DPLL_QUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: dpll_stateName2StateId['queue_occurrence_list_state'],
	run: queueOccurrenceList,
	description: 'Stack a set of clause as pending',
	transitions: new Map<DPLL_QUEUE_OCCURRENCE_LIST_INPUT, number>()
		.set(
			'are_remaining_occurrences_state',
			dpll_stateName2StateId['are_remaining_occurrences_state']
		)
		.set('traversed_occurrences_state', dpll_stateName2StateId['traversed_occurrences_state'])
};

const dequeue_occurrence_list_state: NonFinalState<
	DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
	DPLL_UNSTACK_CLAUSE_SET_INPUT
> = {
	id: dpll_stateName2StateId['dequeue_occurrence_list_state'],
	run: unstackOccurrenceList,
	description: 'Unstack the set of clause',
	transitions: new Map<DPLL_UNSTACK_CLAUSE_SET_INPUT, number>().set(
		'are_remaining_occurrences_state',
		dpll_stateName2StateId['are_remaining_occurrences_state']
	)
};

const at_level_zero_state: NonFinalState<DPLL_AT_LEVEL_ZERO_FUN, DPLL_AT_LEVEL_ZERO_INPUT> = {
	id: dpll_stateName2StateId['at_level_zero_state'],
	run: atLevelZeroFun,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<DPLL_AT_LEVEL_ZERO_INPUT, number>()
		.set('backtracking_state', dpll_stateName2StateId['backtracking_state'])
		.set('unsat_state', dpll_stateName2StateId['unsat_state'])
};

const backtracking_state: NonFinalState<DPLL_BACKTRACKING_FUN, DPLL_BACKTRACKING_INPUT> = {
	id: dpll_stateName2StateId['backtracking_state'],
	run: backtracking,
	description: `Executes a backtracking step`,
	transitions: new Map<DPLL_BACKTRACKING_INPUT, number>().set(
		'complementary_occurrences_state',
		dpll_stateName2StateId['complementary_occurrences_state']
	)
};

const wipe_occurrence_queue_state: NonFinalState<
	DPLL_WIPE_OCCURRENCE_QUEUE_FUN,
	DPLL_WIPE_OCCURRENCE_QUEUE_INPUT
> = {
	id: dpll_stateName2StateId['wipe_occurrence_queue_state'],
	run: wipeOccurrenceQueue,
	description: `Wipes the occurrence queue`,
	transitions: new Map<DPLL_WIPE_OCCURRENCE_QUEUE_INPUT, number>().set(
		'at_level_zero_state',
		dpll_stateName2StateId['at_level_zero_state']
	)
};

// *** adding states to the set of states ***
export const states: Map<number, State<DPLL_FUN, DPLL_INPUT>> = new Map();

states.set(unary_empty_clauses_detection_state.id, unary_empty_clauses_detection_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(are_remaining_occurrences_state.id, are_remaining_occurrences_state);
states.set(queue_occurrence_list_state.id, queue_occurrence_list_state);
states.set(pick_occurrence_list_state.id, pick_occurrence_list_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(dequeue_occurrence_list_state.id, dequeue_occurrence_list_state);
states.set(next_clause_state.id, next_clause_state);
states.set(occurrence_list_traversed_state.id, occurrence_list_traversed_state);
states.set(falsified_clause_state.id, falsified_clause_state);
states.set(unit_clause_state.id, unit_clause_state);
states.set(unit_propagation_state.id, unit_propagation_state);
states.set(complementary_occurrences_state.id, complementary_occurrences_state);
states.set(at_level_zero_state.id, at_level_zero_state);
states.set(backtracking_state.id, backtracking_state);
states.set(wipe_occurrence_queue_state.id, wipe_occurrence_queue_state);

export const initial = unary_empty_clauses_detection_state.id;

export const conflict = wipe_occurrence_queue_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;

export const decision = decide_state.id;
