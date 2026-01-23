import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import { DECIDE_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	allAssigned,
	assertingClause,
	backjumping,
	buildConflictAnalysis,
	complementaryOccurrences,
	decide,
	dequeueOccurrenceList,
	learnConflictClause,
	nextClause,
	atLevelZeroFun,
	pendingOccurrenceList,
	pushTrail,
	queueOccurrenceList,
	sndHighestDL,
	traversedOccurrenceList,
	unitClause,
	unaryEmptyClausesDetection,
	unitPropagation,
	unsatisfiedClause,
	virtualResolution,
	wipeOccurrenceQueue,
	type CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	type CDCL_ALL_VARIABLES_ASSIGNED_INPUT,
	type CDCL_ASSERTING_CLAUSE_FUN,
	type CDCL_ASSERTING_CLAUSE_INPUT,
	type CDCL_AT_LEVEL_ZERO_FUN,
	type CDCL_AT_LEVEL_ZERO_INPUT,
	type CDCL_BACKJUMPING_FUN,
	type CDCL_BACKJUMPING_INPUT,
	type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
	type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	type CDCL_COMPLEMENTARY_OCCURRENCES_FUN,
	type CDCL_COMPLEMENTARY_OCCURRENCES_INPUT,
	type CDCL_CONFLICT_DETECTION_FUN,
	type CDCL_CONFLICT_DETECTION_INPUT,
	type CDCL_DECIDE_FUN,
	type CDCL_DECIDE_INPUT,
	type CDCL_FUN,
	type CDCL_INPUT,
	type CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	type CDCL_LEARN_CONFLICT_CLAUSE_INPUT,
	type CDCL_NEXT_OCCURRENCE_FUN,
	type CDCL_NEXT_OCCURRENCE_INPUT,
	type CDCL_PUSH_TRAIL_FUN,
	type CDCL_PUSH_TRAIL_INPUT,
	type CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	type CDCL_QUEUE_OCCURRENCE_LIST_INPUT,
	type CDCL_SECOND_HIGHEST_DL_FUN,
	type CDCL_SECOND_HIGHEST_DL_INPUT,
	type CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
	type CDCL_TRAVERSED_OCCURRENCE_LIST_INPUT,
	type CDCL_UNIT_CLAUSE_FUN,
	type CDCL_UNIT_CLAUSE_INPUT,
	type CDCL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	type CDCL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	type CDCL_UNIT_PROPAGATION_FUN,
	type CDCL_UNIT_PROPAGATION_INPUT,
	type CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
	type CDCL_UNSTACK_OCCURRENCE_LIST_INPUT,
	type CDCL_VIRTUAL_RESOLUTION_FUN,
	type CDCL_VIRTUAL_RESOLUTION_INPUT,
	type CDCL_WIPE_OCCURRENCE_QUEUE_FUN,
	type CDCL_WIPE_OCCURRENCE_QUEUE_INPUT
} from './cdcl-domain.svelte.ts';

export const cdcl_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	unary_empty_clause_detection_state: 0,
	queue_occurrence_list_state: 1,
	are_remaining_occurrences_state: 2,
	all_variables_assigned_state: 3,
	dequeue_occurrence_list_state: 4,
	clause_evaluation_state: 5,
	traversed_occurrences_state: 6,
	next_clause_state: 7,
	falsified_clause_state: 8,
	unit_clause_state: 9,
	unit_propagation_state: 10,
	complementary_occurrences_state: 11,
	at_level_zero_state: 12,
	wipe_occurrences_queue_state: 13,
	build_conflict_analysis_state: 14,
	asserting_clause_state: 15,
	virtual_resolution_state: 16,
	learn_cc_state: 17,
	second_highest_dl_state: 18,
	undo_trail_to_shdl_state: 19,
	push_trail_state: 20
};

// *** define state nodes ***
const unsat_state: FinalState<never> = {
	id: cdcl_stateName2StateId['unsat_state'],
	description: 'UNSAT state'
};

const sat_state: FinalState<never> = {
	id: cdcl_stateName2StateId['sat_state'],
	description: 'SAT state'
};

// FYI: this state retrieves the clauses that are unit
const unary_empty_clauses_detection_state: NonFinalState<
	CDCL_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	CDCL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
> = {
	id: cdcl_stateName2StateId['unary_empty_clause_detection_state'],
	run: unaryEmptyClausesDetection,
	description: 'Seeks for the problem s unit clauses',
	transitions: new Map<CDCL_UNARY_EMPTY_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrences_state',
		cdcl_stateName2StateId['queue_occurrence_list_state']
	)
};

const decide_state: NonFinalState<CDCL_DECIDE_FUN, CDCL_DECIDE_INPUT> = {
	id: cdcl_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<CDCL_DECIDE_INPUT, number>().set(
		'complementary_occurrences_retrieve_state',
		cdcl_stateName2StateId['complementary_occurrences_state']
	)
};

const all_variables_assigned_state: NonFinalState<
	CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	CDCL_ALL_VARIABLES_ASSIGNED_INPUT
> = {
	id: cdcl_stateName2StateId['all_variables_assigned_state'],
	description: 'Verify if all variables have been assigned',
	run: allAssigned,
	transitions: new Map<CDCL_ALL_VARIABLES_ASSIGNED_INPUT, number>()
		.set('sat_state', cdcl_stateName2StateId['sat_state'])
		.set('decide_state', cdcl_stateName2StateId['decide_state'])
};

const are_remaining_occurrences_state: NonFinalState<
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
> = {
	id: cdcl_stateName2StateId['are_remaining_occurrences_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: pendingOccurrenceList,
	transitions: new Map<CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT, number>()
		.set('traversed_occurrences_state', cdcl_stateName2StateId['traversed_occurrences_state'])
		.set('all_variables_assigned_state', cdcl_stateName2StateId['all_variables_assigned_state'])
};

const occurrence_list_traversed_state: NonFinalState<
	CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
	CDCL_TRAVERSED_OCCURRENCE_LIST_INPUT
> = {
	id: cdcl_stateName2StateId['traversed_occurrences_state'],
	description: 'True if current occurrence list has been completely traversed, false otherwise',
	run: traversedOccurrenceList,
	transitions: new Map<CDCL_TRAVERSED_OCCURRENCE_LIST_INPUT, number>()
		.set('next_clause_state', cdcl_stateName2StateId['next_clause_state'])
		.set('dequeue_occurrence_list_state', cdcl_stateName2StateId['dequeue_occurrence_list_state'])
};

const next_clause_state: NonFinalState<CDCL_NEXT_OCCURRENCE_FUN, CDCL_NEXT_OCCURRENCE_INPUT> = {
	id: cdcl_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause of the current occurrence list',
	run: nextClause,
	transitions: new Map<CDCL_NEXT_OCCURRENCE_INPUT, number>().set(
		'falsified_clause_state',
		cdcl_stateName2StateId['falsified_clause_state']
	)
};

const falsified_clause_state: NonFinalState<
	CDCL_CONFLICT_DETECTION_FUN,
	CDCL_CONFLICT_DETECTION_INPUT
> = {
	id: cdcl_stateName2StateId['falsified_clause_state'],
	run: unsatisfiedClause,
	description: 'Checks if the visiting clause has been falsified',
	transitions: new Map<CDCL_CONFLICT_DETECTION_INPUT, number>()
		.set('unit_clause_state', cdcl_stateName2StateId['unit_clause_state'])
		.set('wipe_occurrences_queue_state', cdcl_stateName2StateId['wipe_occurrences_queue_state'])
};

const unit_clause_state: NonFinalState<CDCL_UNIT_CLAUSE_FUN, CDCL_UNIT_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<CDCL_UNIT_CLAUSE_INPUT, number>()
		.set('traversed_occurrences_state', cdcl_stateName2StateId['traversed_occurrences_state'])
		.set('unit_propagation_state', cdcl_stateName2StateId['unit_propagation_state'])
};

const unit_propagation_state: NonFinalState<
	CDCL_UNIT_PROPAGATION_FUN,
	CDCL_UNIT_PROPAGATION_INPUT
> = {
	id: cdcl_stateName2StateId['unit_propagation_state'],
	run: unitPropagation,
	description: 'Propagates the unassigned literal of a clause',
	transitions: new Map<CDCL_UNIT_PROPAGATION_INPUT, number>().set(
		'complementary_occurrences_retrieve_state',
		cdcl_stateName2StateId['complementary_occurrences_state']
	)
};

const complementary_occurrences_state: NonFinalState<
	CDCL_COMPLEMENTARY_OCCURRENCES_FUN,
	CDCL_COMPLEMENTARY_OCCURRENCES_INPUT
> = {
	id: cdcl_stateName2StateId['complementary_occurrences_state'],
	run: complementaryOccurrences,
	description: 'Get the clauses where the complementary of the last assigned literal appear',
	transitions: new Map<CDCL_COMPLEMENTARY_OCCURRENCES_INPUT, number>().set(
		'queue_occurrences_state',
		cdcl_stateName2StateId['queue_occurrence_list_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	CDCL_QUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: cdcl_stateName2StateId['queue_occurrence_list_state'],
	run: queueOccurrenceList,
	description: 'Stack an occurrence list as pending',
	transitions: new Map<CDCL_QUEUE_OCCURRENCE_LIST_INPUT, number>()
		.set(
			'are_remaining_occurrences_state',
			cdcl_stateName2StateId['are_remaining_occurrences_state']
		)
		.set('traversed_occurrences_state', cdcl_stateName2StateId['traversed_occurrences_state'])
};

const dequeue_occurrence_list_state: NonFinalState<
	CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
	CDCL_UNSTACK_OCCURRENCE_LIST_INPUT
> = {
	id: cdcl_stateName2StateId['dequeue_occurrence_list_state'],
	run: dequeueOccurrenceList,
	description: 'Unstack the set of clause',
	transitions: new Map<CDCL_UNSTACK_OCCURRENCE_LIST_INPUT, number>().set(
		'are_remaining_occurrences_state',
		cdcl_stateName2StateId['are_remaining_occurrences_state']
	)
};

const at_level_zero_state: NonFinalState<CDCL_AT_LEVEL_ZERO_FUN, CDCL_AT_LEVEL_ZERO_INPUT> = {
	id: cdcl_stateName2StateId['at_level_zero_state'],
	run: atLevelZeroFun,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<CDCL_AT_LEVEL_ZERO_INPUT, number>()
		.set('build_conflict_analysis_state', cdcl_stateName2StateId['build_conflict_analysis_state'])
		.set('unsat_state', cdcl_stateName2StateId['unsat_state'])
};

const wipe_occurrence_queue_state: NonFinalState<
	CDCL_WIPE_OCCURRENCE_QUEUE_FUN,
	CDCL_WIPE_OCCURRENCE_QUEUE_INPUT
> = {
	id: cdcl_stateName2StateId['wipe_occurrences_queue_state'],
	run: wipeOccurrenceQueue,
	description: `Wipes the occurrence queue`,
	transitions: new Map<CDCL_WIPE_OCCURRENCE_QUEUE_INPUT, number>().set(
		'at_level_zero_state',
		cdcl_stateName2StateId['at_level_zero_state']
	)
};

// ** additional states from cdcl **

const virtual_resolution_state: NonFinalState<
	CDCL_VIRTUAL_RESOLUTION_FUN,
	CDCL_VIRTUAL_RESOLUTION_INPUT
> = {
	id: cdcl_stateName2StateId['virtual_resolution_state'],
	run: virtualResolution,
	description: `A single resolution step`,
	transitions: new Map<CDCL_VIRTUAL_RESOLUTION_INPUT, number>().set(
		'asserting_clause_state',
		cdcl_stateName2StateId['asserting_clause_state']
	)
};

const build_conflict_analysis_state: NonFinalState<
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
> = {
	id: cdcl_stateName2StateId['build_conflict_analysis_state'],
	run: buildConflictAnalysis,
	description: `Builds the Conflict Analysis Structure`,
	transitions: new Map<CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT, number>().set(
		'asserting_clause_state',
		cdcl_stateName2StateId['asserting_clause_state']
	)
};

const asserting_clause_state: NonFinalState<
	CDCL_ASSERTING_CLAUSE_FUN,
	CDCL_ASSERTING_CLAUSE_INPUT
> = {
	id: cdcl_stateName2StateId['asserting_clause_state'],
	run: assertingClause,
	description: `Checks if the conflict clause is an Asserting Clause`,
	transitions: new Map<CDCL_ASSERTING_CLAUSE_INPUT, number>()
		.set('learn_cc_state', cdcl_stateName2StateId['learn_cc_state'])
		.set('virtual_resolution_state', cdcl_stateName2StateId['virtual_resolution_state'])
};

const learn_cc_state: NonFinalState<
	CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	CDCL_LEARN_CONFLICT_CLAUSE_INPUT
> = {
	id: cdcl_stateName2StateId['learn_cc_state'],
	run: learnConflictClause,
	description: `Inserts the new clause inside the clause pool`,
	transitions: new Map<CDCL_LEARN_CONFLICT_CLAUSE_INPUT, number>().set(
		'second_highest_dl_state',
		cdcl_stateName2StateId['second_highest_dl_state']
	)
};

const second_highest_dl_state: NonFinalState<
	CDCL_SECOND_HIGHEST_DL_FUN,
	CDCL_SECOND_HIGHEST_DL_INPUT
> = {
	id: cdcl_stateName2StateId['second_highest_dl_state'],
	run: sndHighestDL,
	description: `Gets the second highest decision level`,
	transitions: new Map<CDCL_SECOND_HIGHEST_DL_INPUT, number>().set(
		'undo_backjumping_state',
		cdcl_stateName2StateId['undo_trail_to_shdl_state']
	)
};

const undo_trail_to_shdl_state: NonFinalState<CDCL_BACKJUMPING_FUN, CDCL_BACKJUMPING_INPUT> = {
	id: cdcl_stateName2StateId['undo_trail_to_shdl_state'],
	run: backjumping,
	description: `Undo the trail until reaching the dl`,
	transitions: new Map<CDCL_BACKJUMPING_INPUT, number>().set(
		'push_trail_state',
		cdcl_stateName2StateId['push_trail_state']
	)
};

const push_trail_state: NonFinalState<CDCL_PUSH_TRAIL_FUN, CDCL_PUSH_TRAIL_INPUT> = {
	id: cdcl_stateName2StateId['push_trail_state'],
	run: pushTrail,
	description: `Pushes the trail that needs to be learned`,
	transitions: new Map<CDCL_PUSH_TRAIL_INPUT, number>().set(
		'unit_propagation_state',
		cdcl_stateName2StateId['unit_propagation_state']
	)
};

// *** adding states to the set of states ***
export const states: Map<number, State<CDCL_FUN, CDCL_INPUT>> = new Map();

states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(unary_empty_clauses_detection_state.id, unary_empty_clauses_detection_state);
states.set(are_remaining_occurrences_state.id, are_remaining_occurrences_state);
states.set(queue_occurrence_list_state.id, queue_occurrence_list_state);
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
states.set(wipe_occurrence_queue_state.id, wipe_occurrence_queue_state);
states.set(build_conflict_analysis_state.id, build_conflict_analysis_state);
states.set(asserting_clause_state.id, asserting_clause_state);
states.set(learn_cc_state.id, learn_cc_state);
states.set(second_highest_dl_state.id, second_highest_dl_state);
states.set(undo_trail_to_shdl_state.id, undo_trail_to_shdl_state);
states.set(push_trail_state.id, push_trail_state);
states.set(virtual_resolution_state.id, virtual_resolution_state);

export const initial = unary_empty_clauses_detection_state.id;

export const conflict = virtual_resolution_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;

export const decision = decide_state.id;
