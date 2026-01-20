import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import { DECIDE_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	allAssigned,
	assertingClause,
	atLevelZeroFun,
	backjumping,
	buildConflictAnalysis,
	complementaryOccurrences,
	decide,
	dequeueOccurrenceList,
	learnConflictClause,
	nextClause,
	pendingOccurrenceList,
	pickPendingOccurrenceList,
	pushTrail,
	queueOccurrenceList,
	sndHighestDL,
	traversedOccurrenceList,
	unaryEmptyClausesDetection,
	unitClause,
	unitPropagation,
	unsatisfiedClause,
	virtualResolution,
	wipeOccurrenceQueue,
	type TWATCH_ALL_VARIABLES_ASSIGNED_FUN,
	type TWATCH_ALL_VARIABLES_ASSIGNED_INPUT,
	type TWATCH_ASSERTING_CLAUSE_FUN,
	type TWATCH_ASSERTING_CLAUSE_INPUT,
	type TWATCH_AT_LEVEL_ZERO_FUN,
	type TWATCH_AT_LEVEL_ZERO_INPUT,
	type TWATCH_BACKJUMPING_FUN,
	type TWATCH_BACKJUMPING_INPUT,
	type TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	type TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
	type TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	type TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	type TWATCH_COMPLEMENTARY_OCCURRENCES_FUN,
	type TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT,
	type TWATCH_CONFLICT_DETECTION_FUN,
	type TWATCH_CONFLICT_DETECTION_INPUT,
	type TWATCH_DECIDE_FUN,
	type TWATCH_DECIDE_INPUT,
	type TWATCH_FUN,
	type TWATCH_INPUT,
	type TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
	type TWATCH_LEARN_CONFLICT_CLAUSE_INPUT,
	type TWATCH_NEXT_OCCURRENCE_FUN,
	type TWATCH_NEXT_OCCURRENCE_INPUT,
	type TWATCH_PICK_OCCURRENCE_LIST_FUN,
	type TWATCH_PICK_OCCURRENCE_LIST_INPUT,
	type TWATCH_PUSH_TRAIL_FUN,
	type TWATCH_PUSH_TRAIL_INPUT,
	type TWATCH_QUEUE_OCCURRENCE_LIST_FUN,
	type TWATCH_QUEUE_OCCURRENCE_LIST_INPUT,
	type TWATCH_SECOND_HIGHEST_DL_FUN,
	type TWATCH_SECOND_HIGHEST_DL_INPUT,
	type TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN,
	type TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT,
	type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	type TWATCH_UNIT_CLAUSE_FUN,
	type TWATCH_UNIT_CLAUSE_INPUT,
	type TWATCH_UNIT_PROPAGATION_FUN,
	type TWATCH_UNIT_PROPAGATION_INPUT,
	type TWATCH_UNSTACK_OCCURRENCE_LIST_FUN,
	type TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT,
	type TWATCH_VIRTUAL_RESOLUTION_FUN,
	type TWATCH_VIRTUAL_RESOLUTION_INPUT,
	type TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
	type TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
} from './twatch-domain.svelte.ts';

export const twatch_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	unary_empty_clause_detection_state: 0,
	queue_occurrence_list_state: 1,
	are_remaining_occurrences_state: 2,
	pick_occurrence_list_state: 3,
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
	wipe_occurrences_queue_state: 14,
	build_conflict_analysis_state: 15,
	asserting_clause_state: 16,
	virtual_resolution_state: 17,
	learn_cc_state: 18,
	second_highest_dl_state: 19,
	undo_trail_to_shdl_state: 20,
	push_trail_state: 21
};

// *** define state nodes ***
const unsat_state: FinalState<never> = {
	id: twatch_stateName2StateId['unsat_state'],
	description: 'UNSAT state'
};

const sat_state: FinalState<never> = {
	id: twatch_stateName2StateId['sat_state'],
	description: 'SAT state'
};

// FYI: this state retrieves the clauses that are unit
const unary_empty_clauses_detection_state: NonFinalState<
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
> = {
	id: twatch_stateName2StateId['unary_empty_clause_detection_state'],
	run: unaryEmptyClausesDetection,
	description: 'Seeks for the problem s unit clauses',
	transitions: new Map<TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrence_list_state',
		twatch_stateName2StateId['queue_occurrence_list_state']
	)
};

const decide_state: NonFinalState<TWATCH_DECIDE_FUN, TWATCH_DECIDE_INPUT> = {
	id: twatch_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<TWATCH_DECIDE_INPUT, number>().set(
		'complementary_occurrences_state',
		twatch_stateName2StateId['complementary_occurrences_state']
	)
};

const all_variables_assigned_state: NonFinalState<
	TWATCH_ALL_VARIABLES_ASSIGNED_FUN,
	TWATCH_ALL_VARIABLES_ASSIGNED_INPUT
> = {
	id: twatch_stateName2StateId['all_variables_assigned_state'],
	description: 'Verify if all variables have been assigned',
	run: allAssigned,
	transitions: new Map<TWATCH_ALL_VARIABLES_ASSIGNED_INPUT, number>()
		.set('sat_state', twatch_stateName2StateId['sat_state'])
		.set('decide_state', twatch_stateName2StateId['decide_state'])
};

const are_remaining_occurrences_state: NonFinalState<
	TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
> = {
	id: twatch_stateName2StateId['are_remaining_occurrences_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: pendingOccurrenceList,
	transitions: new Map<TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT, number>()
		.set('pick_occurrence_list_state', twatch_stateName2StateId['pick_occurrence_list_state'])
		.set('all_variables_assigned_state', twatch_stateName2StateId['all_variables_assigned_state'])
};

const pick_occurrence_list_state: NonFinalState<
	TWATCH_PICK_OCCURRENCE_LIST_FUN,
	TWATCH_PICK_OCCURRENCE_LIST_INPUT
> = {
	id: twatch_stateName2StateId['pick_occurrence_list_state'],
	description: 'Selects the next occurrence list to process queued',
	run: pickPendingOccurrenceList,
	transitions: new Map<TWATCH_PICK_OCCURRENCE_LIST_INPUT, number>().set(
		'traversed_occurrences_state',
		twatch_stateName2StateId['traversed_occurrences_state']
	)
};

const occurrence_list_traversed_state: NonFinalState<
	TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN,
	TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT
> = {
	id: twatch_stateName2StateId['traversed_occurrences_state'],
	description: 'True if current occurrence list has been completely traversed, false otherwise',
	run: traversedOccurrenceList,
	transitions: new Map<TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT, number>()
		.set('next_clause_state', twatch_stateName2StateId['next_clause_state'])
		.set('dequeue_occurrence_list_state', twatch_stateName2StateId['dequeue_occurrence_list_state'])
};

const next_clause_state: NonFinalState<TWATCH_NEXT_OCCURRENCE_FUN, TWATCH_NEXT_OCCURRENCE_INPUT> = {
	id: twatch_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause of the current occurrence list',
	run: nextClause,
	transitions: new Map<TWATCH_NEXT_OCCURRENCE_INPUT, number>().set(
		'falsified_clause_state',
		twatch_stateName2StateId['falsified_clause_state']
	)
};

const falsified_clause_state: NonFinalState<
	TWATCH_CONFLICT_DETECTION_FUN,
	TWATCH_CONFLICT_DETECTION_INPUT
> = {
	id: twatch_stateName2StateId['falsified_clause_state'],
	run: unsatisfiedClause,
	description: 'Checks if the visiting clause has been falsified',
	transitions: new Map<TWATCH_CONFLICT_DETECTION_INPUT, number>()
		.set('unit_clause_state', twatch_stateName2StateId['unit_clause_state'])
		.set('wipe_occurrences_queue_state', twatch_stateName2StateId['wipe_occurrences_queue_state'])
};

const unit_clause_state: NonFinalState<TWATCH_UNIT_CLAUSE_FUN, TWATCH_UNIT_CLAUSE_INPUT> = {
	id: twatch_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<TWATCH_UNIT_CLAUSE_INPUT, number>()
		.set('traversed_occurrences_state', twatch_stateName2StateId['traversed_occurrences_state'])
		.set('unit_propagation_state', twatch_stateName2StateId['unit_propagation_state'])
};

const unit_propagation_state: NonFinalState<
	TWATCH_UNIT_PROPAGATION_FUN,
	TWATCH_UNIT_PROPAGATION_INPUT
> = {
	id: twatch_stateName2StateId['unit_propagation_state'],
	run: unitPropagation,
	description: 'Propagates the unassigned literal of a clause',
	transitions: new Map<TWATCH_UNIT_PROPAGATION_INPUT, number>().set(
		'complementary_occurrences_state',
		twatch_stateName2StateId['complementary_occurrences_state']
	)
};

const complementary_occurrences_state: NonFinalState<
	TWATCH_COMPLEMENTARY_OCCURRENCES_FUN,
	TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['complementary_occurrences_state'],
	run: complementaryOccurrences,
	description: 'Get the clauses where the complementary of the last assigned literal appear',
	transitions: new Map<TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT, number>().set(
		'queue_occurrence_list_state',
		twatch_stateName2StateId['queue_occurrence_list_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	TWATCH_QUEUE_OCCURRENCE_LIST_FUN,
	TWATCH_QUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: twatch_stateName2StateId['queue_occurrence_list_state'],
	run: queueOccurrenceList,
	description: 'Stack an occurrence list as pending',
	transitions: new Map<TWATCH_QUEUE_OCCURRENCE_LIST_INPUT, number>()
		.set(
			'are_remaining_occurrences_state',
			twatch_stateName2StateId['are_remaining_occurrences_state']
		)
		.set('traversed_occurrences_state', twatch_stateName2StateId['traversed_occurrences_state'])
};

const dequeue_occurrence_list_state: NonFinalState<
	TWATCH_UNSTACK_OCCURRENCE_LIST_FUN,
	TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT
> = {
	id: twatch_stateName2StateId['dequeue_occurrence_list_state'],
	run: dequeueOccurrenceList,
	description: 'Unstack the set of clause',
	transitions: new Map<TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT, number>().set(
		'are_remaining_occurrences_state',
		twatch_stateName2StateId['are_remaining_occurrences_state']
	)
};

const at_level_zero_state: NonFinalState<TWATCH_AT_LEVEL_ZERO_FUN, TWATCH_AT_LEVEL_ZERO_INPUT> = {
	id: twatch_stateName2StateId['at_level_zero_state'],
	run: atLevelZeroFun,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<TWATCH_AT_LEVEL_ZERO_INPUT, number>()
		.set('build_conflict_analysis_state', twatch_stateName2StateId['build_conflict_analysis_state'])
		.set('unsat_state', twatch_stateName2StateId['unsat_state'])
};

const wipe_occurrence_queue_state: NonFinalState<
	TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
	TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
> = {
	id: twatch_stateName2StateId['wipe_occurrences_queue_state'],
	run: wipeOccurrenceQueue,
	description: `Wipes the occurrence queue`,
	transitions: new Map<TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT, number>().set(
		'at_level_zero_state',
		twatch_stateName2StateId['at_level_zero_state']
	)
};

// ** additional states from cdcl **

const virtual_resolution_state: NonFinalState<
	TWATCH_VIRTUAL_RESOLUTION_FUN,
	TWATCH_VIRTUAL_RESOLUTION_INPUT
> = {
	id: twatch_stateName2StateId['virtual_resolution_state'],
	run: virtualResolution,
	description: `A single resolution step`,
	transitions: new Map<TWATCH_VIRTUAL_RESOLUTION_INPUT, number>().set(
		'asserting_clause_state',
		twatch_stateName2StateId['asserting_clause_state']
	)
};

const build_conflict_analysis_state: NonFinalState<
	TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
> = {
	id: twatch_stateName2StateId['build_conflict_analysis_state'],
	run: buildConflictAnalysis,
	description: `Builds the Conflict Analysis Structure`,
	transitions: new Map<TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT, number>().set(
		'asserting_clause_state',
		twatch_stateName2StateId['asserting_clause_state']
	)
};

const asserting_clause_state: NonFinalState<
	TWATCH_ASSERTING_CLAUSE_FUN,
	TWATCH_ASSERTING_CLAUSE_INPUT
> = {
	id: twatch_stateName2StateId['asserting_clause_state'],
	run: assertingClause,
	description: `Checks if the conflict clause is an Asserting Clause`,
	transitions: new Map<TWATCH_ASSERTING_CLAUSE_INPUT, number>()
		.set('learn_cc_state', twatch_stateName2StateId['learn_cc_state'])
		.set('virtual_resolution_state', twatch_stateName2StateId['virtual_resolution_state'])
};

const learn_cc_state: NonFinalState<
	TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
	TWATCH_LEARN_CONFLICT_CLAUSE_INPUT
> = {
	id: twatch_stateName2StateId['learn_cc_state'],
	run: learnConflictClause,
	description: `Inserts the new clause inside the clause pool`,
	transitions: new Map<TWATCH_LEARN_CONFLICT_CLAUSE_INPUT, number>().set(
		'second_highest_dl_state',
		twatch_stateName2StateId['second_highest_dl_state']
	)
};

const second_highest_dl_state: NonFinalState<
	TWATCH_SECOND_HIGHEST_DL_FUN,
	TWATCH_SECOND_HIGHEST_DL_INPUT
> = {
	id: twatch_stateName2StateId['second_highest_dl_state'],
	run: sndHighestDL,
	description: `Gets the second highest decision level`,
	transitions: new Map<TWATCH_SECOND_HIGHEST_DL_INPUT, number>().set(
		'undo_backjumping_state',
		twatch_stateName2StateId['undo_trail_to_shdl_state']
	)
};

const undo_trail_to_shdl_state: NonFinalState<TWATCH_BACKJUMPING_FUN, TWATCH_BACKJUMPING_INPUT> = {
	id: twatch_stateName2StateId['undo_trail_to_shdl_state'],
	run: backjumping,
	description: `Undo the trail until reaching the dl`,
	transitions: new Map<TWATCH_BACKJUMPING_INPUT, number>().set(
		'push_trail_state',
		twatch_stateName2StateId['push_trail_state']
	)
};

const push_trail_state: NonFinalState<TWATCH_PUSH_TRAIL_FUN, TWATCH_PUSH_TRAIL_INPUT> = {
	id: twatch_stateName2StateId['push_trail_state'],
	run: pushTrail,
	description: `Pushes the trail that needs to be learned`,
	transitions: new Map<TWATCH_PUSH_TRAIL_INPUT, number>().set(
		'unit_propagation_state',
		twatch_stateName2StateId['unit_propagation_state']
	)
};

// *** adding states to the set of states ***
export const states: Map<number, State<TWATCH_FUN, TWATCH_INPUT>> = new Map();

states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(unary_empty_clauses_detection_state.id, unary_empty_clauses_detection_state);
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
