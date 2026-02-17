import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import { DECIDE_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	addWatch,
	allVariablesAssigned,
	assertingClause,
	atLevelZeroFun,
	backjumping,
	buildConflictAnalysis,
	clauseFalsified,
	complementaryOccurrences,
	complementaryWatchedOccurrences,
	decide,
	deleteWatch,
	dequeueCurrentOccurrences,
	firstLiteralFalsified,
	firstLiteralSatisfied,
	isItAWatch,
	learnConflictClause,
	lookNonFalsifiedLiteral,
	nextClause,
	nonFalsifiedLiteralFound,
	pendingOccurrences,
	pushTrail,
	queueOccurrences,
	queueWatchedOccurrences,
	sndHighestDL,
	swapSecondKLiteralPos,
	swapWatches,
	traversedCurrentOccurrences,
	unaryEmptyClausesDetection,
	unitPropagation,
	virtualResolution,
	watchAtFirstPosition,
	wipeOccurrenceQueue,
	type TWATCH_ADD_WATCH_FUN,
	type TWATCH_ADD_WATCH_INPUT,
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
	type TWATCH_CHECK_PENDING_OCCURRENCES_FUN,
	type TWATCH_CHECK_PENDING_OCCURRENCES_INPUT,
	type TWATCH_CLAUSE_FALSIFIED_FUN,
	type TWATCH_CLAUSE_FALSIFIED_INPUT,
	type TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN,
	type TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT,
	type TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN,
	type TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT,
	type TWATCH_DECIDE_FUN,
	type TWATCH_DECIDE_INPUT,
	type TWATCH_DELETE_WATCH_FUN,
	type TWATCH_DELETE_WATCH_INPUT,
	type TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN,
	type TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT,
	type TWATCH_FIRST_LITERAL_FALSIFIED_FUN,
	type TWATCH_FIRST_LITERAL_FALSIFIED_INPUT,
	type TWATCH_FIRST_LITERAL_SATISFIED_FUN,
	type TWATCH_FIRST_LITERAL_SATISFIED_INPUT,
	type TWATCH_FUN,
	type TWATCH_INPUT,
	type TWATCH_IS_IT_A_WATCH_FUN,
	type TWATCH_IS_IT_A_WATCH_INPUT,
	type TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
	type TWATCH_LEARN_CONFLICT_CLAUSE_INPUT,
	type TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN,
	type TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT,
	type TWATCH_NEXT_OCCURRENCE_FUN,
	type TWATCH_NEXT_OCCURRENCE_INPUT,
	type TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN,
	type TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT,
	type TWATCH_PUSH_TRAIL_FUN,
	type TWATCH_PUSH_TRAIL_INPUT,
	type TWATCH_QUEUE_OCCURRENCES_FUN,
	type TWATCH_QUEUE_OCCURRENCES_INPUT,
	type TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN,
	type TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT,
	type TWATCH_SECOND_HIGHEST_DL_FUN,
	type TWATCH_SECOND_HIGHEST_DL_INPUT,
	type TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN,
	type TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT,
	type TWATCH_SWAP_WATCHES_FUN,
	type TWATCH_SWAP_WATCHES_INPUT,
	type TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN,
	type TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT,
	type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	type TWATCH_UNIT_PROPAGATION_FUN,
	type TWATCH_UNIT_PROPAGATION_INPUT,
	type TWATCH_VIRTUAL_RESOLUTION_FUN,
	type TWATCH_VIRTUAL_RESOLUTION_INPUT,
	type TWATCH_WATCH_AT_FIRST_POSITION_FUN,
	type TWATCH_WATCH_AT_FIRST_POSITION_INPUT,
	type TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
	type TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
} from './twatch-domain.svelte.ts';

export const twatch_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	unary_empty_clause_detection_state: 0,
	are_remaining_occurrences_state: 1,
	complementary_occurrences_retrieve_state: 2,
	queue_occurrences_state: 3,
	dequeue_occurrence_list_state: 4,
	traversed_current_occurrences_state: 5,
	next_occurrence_state: 7,
	unit_clause_state: 8,
	all_variables_assigned_state: 6,
	unit_propagation_state: 9,
	at_level_zero_state: 10,
	wipe_occurrences_queue_state: 11,
	build_conflict_analysis_state: 12,
	asserting_clause_state: 13,
	virtual_resolution_state: 14,
	learn_cc_state: 15,
	second_highest_dl_state: 16,
	undo_trail_to_shdl_state: 17,
	push_trail_state: 18,
	queue_watched_occurrences_state: 19,
	watch_at_first_position_state: 20,
	swap_watches_state: 21,
	first_literal_satisfied_state: 22,
	look_non_falsified_literal_state: 23,
	non_falsified_literal_found_state: 24,
	delete_watch_state: 25,
	swap_second_k_literal_position_state: 26,
	add_watch_state: 27,
	first_literal_falsified_state: 28,
	complementary_watched_occurrences_retrieve_state: 29,
	is_it_a_watch_state: 30,
	clause_falsified_state: 31
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
	description: 'Seeks for the problems unit clauses',
	transitions: new Map<TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrences_state',
		twatch_stateName2StateId['queue_occurrences_state']
	)
};

const decide_state: NonFinalState<TWATCH_DECIDE_FUN, TWATCH_DECIDE_INPUT> = {
	id: twatch_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<TWATCH_DECIDE_INPUT, number>().set(
		'complementary_occurrences_retrieve_state',
		twatch_stateName2StateId['complementary_occurrences_retrieve_state']
	)
};

const all_variables_assigned_state: NonFinalState<
	TWATCH_ALL_VARIABLES_ASSIGNED_FUN,
	TWATCH_ALL_VARIABLES_ASSIGNED_INPUT
> = {
	id: twatch_stateName2StateId['all_variables_assigned_state'],
	description: 'Verify if all variables have been assigned',
	run: allVariablesAssigned,
	transitions: new Map<TWATCH_ALL_VARIABLES_ASSIGNED_INPUT, number>()
		.set('sat_state', twatch_stateName2StateId['sat_state'])
		.set('decide_state', twatch_stateName2StateId['decide_state'])
};

const are_remaining_occurrences_state: NonFinalState<
	TWATCH_CHECK_PENDING_OCCURRENCES_FUN,
	TWATCH_CHECK_PENDING_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['are_remaining_occurrences_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: pendingOccurrences,
	transitions: new Map<TWATCH_CHECK_PENDING_OCCURRENCES_INPUT, number>()
		.set(
			'traversed_current_occurrences_state',
			twatch_stateName2StateId['traversed_current_occurrences_state']
		)
		.set('all_variables_assigned_state', twatch_stateName2StateId['all_variables_assigned_state'])
};

const occurrence_list_traversed_state: NonFinalState<
	TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN,
	TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['traversed_current_occurrences_state'],
	description: 'True if current occurrence list has been completely traversed, false otherwise',
	run: traversedCurrentOccurrences,
	transitions: new Map<TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT, number>()
		.set('next_clause_state', twatch_stateName2StateId['next_occurrence_state'])
		.set(
			'dequeue_current_occurrences_state',
			twatch_stateName2StateId['dequeue_occurrence_list_state']
		)
};

const next_clause_state: NonFinalState<TWATCH_NEXT_OCCURRENCE_FUN, TWATCH_NEXT_OCCURRENCE_INPUT> = {
	id: twatch_stateName2StateId['next_occurrence_state'],
	description: 'Returns the next occurrence of the current watched list',
	run: nextClause,
	transitions: new Map<TWATCH_NEXT_OCCURRENCE_INPUT, number>().set(
		'is_it_a_watch_state',
		twatch_stateName2StateId['is_it_a_watch_state']
	)
};

const unit_propagation_state: NonFinalState<
	TWATCH_UNIT_PROPAGATION_FUN,
	TWATCH_UNIT_PROPAGATION_INPUT
> = {
	id: twatch_stateName2StateId['unit_propagation_state'],
	run: unitPropagation,
	description: 'Propagates the unassigned literal of a clause',
	transitions: new Map<TWATCH_UNIT_PROPAGATION_INPUT, number>().set(
		'complementary_occurrences_retrieve_state',
		twatch_stateName2StateId['complementary_occurrences_retrieve_state']
	)
};

const complementary_occurrences_state: NonFinalState<
	TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN,
	TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT
> = {
	id: twatch_stateName2StateId['complementary_occurrences_retrieve_state'],
	run: complementaryOccurrences,
	description: 'Get the clauses where the complementary of the last assigned literal appear',
	transitions: new Map<TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT, number>().set(
		'queue_occurrences_state',
		twatch_stateName2StateId['queue_occurrences_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	TWATCH_QUEUE_OCCURRENCES_FUN,
	TWATCH_QUEUE_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['queue_occurrences_state'],
	run: queueOccurrences,
	description: 'Stack an occurrence list as pending',
	transitions: new Map<TWATCH_QUEUE_OCCURRENCES_INPUT, number>()
		.set(
			'complementary_watched_occurrences_retrieve_state',
			twatch_stateName2StateId['complementary_watched_occurrences_retrieve_state']
		)
		.set(
			'queue_watched_occurrences_state',
			twatch_stateName2StateId['queue_watched_occurrences_state']
		)
};

const dequeue_occurrence_list_state: NonFinalState<
	TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN,
	TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['dequeue_occurrence_list_state'],
	run: dequeueCurrentOccurrences,
	description: 'Unstack the set of clause',
	transitions: new Map<TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT, number>().set(
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

// *** additional states from 2watch ***

const complementary_watched_occurrences_retrieve_state: NonFinalState<
	TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN,
	TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT
> = {
	id: twatch_stateName2StateId['complementary_watched_occurrences_retrieve_state'],
	run: complementaryWatchedOccurrences,
	description: '',
	transitions: new Map<TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT, number>().set(
		'queue_watched_occurrences_state',
		twatch_stateName2StateId['queue_watched_occurrences_state']
	)
};

const queue_watched_occurrences_state: NonFinalState<
	TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN,
	TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT
> = {
	id: twatch_stateName2StateId['queue_watched_occurrences_state'],
	run: queueWatchedOccurrences,
	description: 'Queues the watched occurrences that need to be revised',
	transitions: new Map<TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT, number>()
		.set(
			'are_remaining_occurrences_state',
			twatch_stateName2StateId['are_remaining_occurrences_state']
		)
		.set(
			'traversed_current_occurrences_state',
			twatch_stateName2StateId['traversed_current_occurrences_state']
		)
};

const is_watch_at_first_position_state: NonFinalState<
	TWATCH_WATCH_AT_FIRST_POSITION_FUN,
	TWATCH_WATCH_AT_FIRST_POSITION_INPUT
> = {
	id: twatch_stateName2StateId['watch_at_first_position_state'],
	run: watchAtFirstPosition,
	description:
		'Returns true if the first position contains the complementary of the occurrence list from the current watch list',
	transitions: new Map<TWATCH_WATCH_AT_FIRST_POSITION_INPUT, number>()
		.set('swap_watches_state', twatch_stateName2StateId['swap_watches_state'])
		.set('first_literal_satisfied_state', twatch_stateName2StateId['first_literal_satisfied_state'])
};

const swap_watches_state: NonFinalState<TWATCH_SWAP_WATCHES_FUN, TWATCH_SWAP_WATCHES_INPUT> = {
	id: twatch_stateName2StateId['swap_watches_state'],
	run: swapWatches,
	description: 'Swap the position of the first and second watch',
	transitions: new Map<TWATCH_SWAP_WATCHES_INPUT, number>().set(
		'first_literal_satisfied_state',
		twatch_stateName2StateId['first_literal_satisfied_state']
	)
};

const first_literal_satisfied_state: NonFinalState<
	TWATCH_FIRST_LITERAL_SATISFIED_FUN,
	TWATCH_FIRST_LITERAL_SATISFIED_INPUT
> = {
	id: twatch_stateName2StateId['first_literal_satisfied_state'],
	run: firstLiteralSatisfied,
	description: 'Returns true if the first literal is satisfied',
	transitions: new Map<TWATCH_FIRST_LITERAL_SATISFIED_INPUT, number>()
		.set(
			'traversed_current_occurrences_state',
			twatch_stateName2StateId['traversed_current_occurrences_state']
		)
		.set(
			'look_non_falsified_literal_state',
			twatch_stateName2StateId['look_non_falsified_literal_state']
		)
};

const look_non_falsified_literal_state: NonFinalState<
	TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN,
	TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT
> = {
	id: twatch_stateName2StateId['look_non_falsified_literal_state'],
	run: lookNonFalsifiedLiteral,
	description:
		'Returns the position of the literal which is not watched and is not falsified, -1 otherwise',
	transitions: new Map<TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT, number>().set(
		'non_falsified_literal_found_state',
		twatch_stateName2StateId['non_falsified_literal_found_state']
	)
};

const non_falsified_literal_found_state: NonFinalState<
	TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN,
	TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT
> = {
	id: twatch_stateName2StateId['non_falsified_literal_found_state'],
	run: nonFalsifiedLiteralFound,
	description: 'Returns true if a literal for swapping was found, false otherwise',
	transitions: new Map<TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT, number>()
		.set('delete_watch_state', twatch_stateName2StateId['delete_watch_state'])
		.set('first_literal_falsified_state', twatch_stateName2StateId['first_literal_falsified_state'])
};

const delete_watch_state: NonFinalState<TWATCH_DELETE_WATCH_FUN, TWATCH_DELETE_WATCH_INPUT> = {
	id: twatch_stateName2StateId['delete_watch_state'],
	run: deleteWatch,
	description: 'Deletes the watch form the second position of the given watch from the watch table',
	transitions: new Map<TWATCH_DELETE_WATCH_INPUT, number>().set(
		'swap_second_k_literal_position_state',
		twatch_stateName2StateId['swap_second_k_literal_position_state']
	)
};

const swap_second_k_literal_position_state: NonFinalState<
	TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN,
	TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT
> = {
	id: twatch_stateName2StateId['swap_second_k_literal_position_state'],
	run: swapSecondKLiteralPos,
	description:
		'Swaps the position of the literal that was found not falsified and the second position',
	transitions: new Map<TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT, number>().set(
		'add_watch_state',
		twatch_stateName2StateId['add_watch_state']
	)
};

const add_watch_state: NonFinalState<TWATCH_ADD_WATCH_FUN, TWATCH_ADD_WATCH_INPUT> = {
	id: twatch_stateName2StateId['add_watch_state'],
	run: addWatch,
	description: 'Deletes the watch form the second position of the given watch from the watch table',
	transitions: new Map<TWATCH_ADD_WATCH_INPUT, number>().set(
		'traversed_current_occurrences_state',
		twatch_stateName2StateId['traversed_current_occurrences_state']
	)
};

const first_literal_falsified_state: NonFinalState<
	TWATCH_FIRST_LITERAL_FALSIFIED_FUN,
	TWATCH_FIRST_LITERAL_FALSIFIED_INPUT
> = {
	id: twatch_stateName2StateId['first_literal_falsified_state'],
	run: firstLiteralFalsified,
	description: 'Returns true if the first literal is falsified. False otherwise.',
	transitions: new Map<TWATCH_FIRST_LITERAL_FALSIFIED_INPUT, number>()
		.set('wipe_occurrences_queue_state', twatch_stateName2StateId['wipe_occurrences_queue_state'])
		.set('unit_propagation_state', twatch_stateName2StateId['unit_propagation_state'])
};

const is_it_a_watch_state: NonFinalState<TWATCH_IS_IT_A_WATCH_FUN, TWATCH_IS_IT_A_WATCH_INPUT> = {
	id: twatch_stateName2StateId['is_it_a_watch_state'],
	run: isItAWatch,
	description: 'Returns true if it is a Watch. False if it is a CRef',
	transitions: new Map<TWATCH_IS_IT_A_WATCH_INPUT, number>()
		.set('watch_at_first_position_state', twatch_stateName2StateId['watch_at_first_position_state'])
		.set('clause_falsified_state', twatch_stateName2StateId['clause_falsified_state'])
};

const is_clause_falsified_state: NonFinalState<
	TWATCH_CLAUSE_FALSIFIED_FUN,
	TWATCH_CLAUSE_FALSIFIED_INPUT
> = {
	id: twatch_stateName2StateId['clause_falsified_state'],
	run: clauseFalsified,
	description: 'Returns true if the clause is falsified. False otherwise.',
	transitions: new Map<TWATCH_CLAUSE_FALSIFIED_INPUT, number>()
		.set('wipe_occurrences_queue_state', twatch_stateName2StateId['wipe_occurrences_queue_state'])
		.set('unit_propagation_state', twatch_stateName2StateId['unit_propagation_state'])
};
// *** adding states to the set of states ***
export const states: Map<number, State<TWATCH_FUN, TWATCH_INPUT>> = new Map();

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
states.set(
	complementary_watched_occurrences_retrieve_state.id,
	complementary_watched_occurrences_retrieve_state
);
states.set(queue_watched_occurrences_state.id, queue_watched_occurrences_state);
states.set(is_watch_at_first_position_state.id, is_watch_at_first_position_state);
states.set(swap_watches_state.id, swap_watches_state);
states.set(first_literal_satisfied_state.id, first_literal_satisfied_state);
states.set(look_non_falsified_literal_state.id, look_non_falsified_literal_state);
states.set(non_falsified_literal_found_state.id, non_falsified_literal_found_state);
states.set(swap_second_k_literal_position_state.id, swap_second_k_literal_position_state);
states.set(first_literal_falsified_state.id, first_literal_falsified_state);
states.set(delete_watch_state.id, delete_watch_state);
states.set(add_watch_state.id, add_watch_state);
states.set(is_it_a_watch_state.id, is_it_a_watch_state);
states.set(is_clause_falsified_state.id, is_clause_falsified_state);

export const initial = unary_empty_clauses_detection_state.id;

export const conflict = virtual_resolution_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;

export const decision = decide_state.id;
