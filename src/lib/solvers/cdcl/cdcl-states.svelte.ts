import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import { DECIDE_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	allAssigned,
	emptyClauseDetection,
	nextClause,
	queueClauseSet,
	unitClauseDetection,
	unstackClauseSet,
	type CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	type CDCL_ALL_VARIABLES_ASSIGNED_INPUT,
	type CDCL_CONFLICT_DETECTION_FUN,
	type CDCL_EMPTY_CLAUSE_FUN,
	type CDCL_EMPTY_CLAUSE_INPUT,
	type CDCL_FUN,
	type CDCL_INPUT,
	type CDCL_PICK_CLAUSE_SET_FUN,
	type CDCL_PICK_CLAUSE_SET_INPUT,
	type CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	type CDCL_QUEUE_OCCURRENCE_LIST_INPUT,
	type CDCL_UNIT_CLAUSES_DETECTION_FUN,
	type CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	type CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
	type CDCL_UNSTACK_OCCURRENCE_LIST_INPUT,
	pickPendingClauseSet,
	type CDCL_ALL_CLAUSES_CHECKED_INPUT,
	type CDCL_ALL_CLAUSES_CHECKED_FUN,
	allClausesChecked,
	type CDCL_NEXT_CLAUSE_FUN,
	type CDCL_NEXT_CLAUSE_INPUT,
	type CDCL_CONFLICT_DETECTION_INPUT,
	unsatisfiedClause,
	type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	thereAreJobPostponed,
	type CDCL_DELETE_CLAUSE_FUN,
	type CDCL_DELETE_CLAUSE_INPUT,
	deleteClause,
	type CDCL_UNIT_CLAUSE_FUN,
	type CDCL_UNIT_CLAUSE_INPUT,
	type CDCL_UNIT_PROPAGATION_FUN,
	type CDCL_UNIT_PROPAGATION_INPUT,
	unitPropagation,
	type CDCL_COMPLEMENTARY_OCCURRENCES_INPUT,
	type CDCL_COMPLEMENTARY_OCCURRENCES_FUN,
	complementaryOccurrences,
	nonDecisionMade,
	type CDCL_CHECK_NON_DECISION_MADE_FUN,
	type CDCL_CHECK_NON_DECISION_MADE_INPUT,
	type CDCL_DECIDE_FUN,
	type CDCL_DECIDE_INPUT,
	decide,
	unitClause,
	type CDCL_EMPTY_OCCURRENCE_LISTS_FUN,
	type CDCL_EMPTY_OCCURRENCE_LISTS_INPUT,
	emptyClauseSet,
	type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
	type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	buildConflictAnalysis,
	type CDCL_ASSERTING_CLAUSE_FUN,
	type CDCL_ASSERTING_CLAUSE_INPUT,
	assertingClause,
	pickLastAssignment,
	type CDCL_PICK_LAST_ASSIGNMENT_FUN,
	type CDCL_PICK_LAST_ASSIGNMENT_INPUT,
	type CDCL_VARIABLE_IN_CC_FUN,
	type CDCL_VARIABLE_IN_CC_INPUT,
	variableInCC,
	type CDCL_DELETE_LAST_ASSIGNMENT_FUN,
	type CDCL_DELETE_LAST_ASSIGNMENT_INPUT,
	deleteLastAssignment,
	type CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	type CDCL_LEARN_CONFLICT_CLAUSE_INPUT,
	type CDCL_SECOND_HIGHEST_DL_FUN,
	type CDCL_SECOND_HIGHEST_DL_INPUT,
	secondHighestDL,
	type CDCL_BACKJUMPING_FUN,
	type CDCL_BACKJUMPING_INPUT,
	backjumping,
	type CDCL_PUSH_TRAIL_FUN,
	type CDCL_PUSH_TRAIL_INPUT,
	pushTrail,
	learnConflictClause,
	resolutionUpdateCC,
	type CDCL_RESOLUTION_UPDATE_CC_FUN,
	type CDCL_RESOLUTION_UPDATE_CC_INPUT,
	type CDCL_PROPAGATE_CC_FUN,
	type CDCL_PROPAGATE_CC_INPUT,
	propagateCC
} from './cdcl-domain.svelte.ts';

export const cdcl_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	empty_clause_state: 0,
	unit_clauses_detection_state: 1,
	queue_occurrence_list_state: 2,
	check_pending_occurrence_lists_state: 3,
	pick_clause_set_state: 4,
	all_variables_assigned_state: 5,
	unstack_occurrence_list_state: 6,
	clause_evaluation_state: 7,
	all_clauses_checked_state: 8,
	next_clause_state: 9,
	conflict_detection_state: 10,
	unit_clause_state: 11,
	delete_clause_state: 12,
	unit_propagation_state: 13,
	complementary_occurrences_state: 14,
	decision_level_state: 15,
	empty_clause_set_state: 16,
	build_conflict_analysis_state: 17,
	asserting_clause_state: 18,
	pick_last_assignment_state: 19,
	variable_in_cc_state: 20,
	resolution_update_cc_state: 21,
	delete_last_assignment_state: 22,
	learn_cc_state: 23,
	second_highest_dl_state: 24,
	undo_trail_to_shdl_state: 25,
	push_trail_state: 26,
	propagate_cc_state: 27
};

// *** define state nodes ***
const unsat_state: FinalState<never> = {
	id: cdcl_stateName2StateId['unsat_state'],
	description: 'UnSAT state'
};

const sat_state: FinalState<never> = {
	id: cdcl_stateName2StateId['sat_state'],
	description: 'SAT state'
};

const unit_clauses_detection_state: NonFinalState<
	CDCL_UNIT_CLAUSES_DETECTION_FUN,
	CDCL_UNIT_CLAUSES_DETECTION_INPUT
> = {
	id: cdcl_stateName2StateId['unit_clauses_detection_state'],
	run: unitClauseDetection,
	description: 'Seeks for the problem s unit clauses',
	transitions: new Map<CDCL_UNIT_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrence_list_state',
		cdcl_stateName2StateId['queue_occurrence_list_state']
	)
};

const empty_clause_state: NonFinalState<CDCL_EMPTY_CLAUSE_FUN, CDCL_EMPTY_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['empty_clause_state'],
	run: emptyClauseDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map<CDCL_EMPTY_CLAUSE_INPUT, number>()
		.set('unit_clauses_detection_state', cdcl_stateName2StateId['unit_clauses_detection_state'])
		.set('unsat_state', cdcl_stateName2StateId['unsat_state'])
};

const decide_state: NonFinalState<CDCL_DECIDE_FUN, CDCL_DECIDE_INPUT> = {
	id: cdcl_stateName2StateId['decide_state'],
	description: 'Executes a decide step',
	run: decide,
	transitions: new Map<CDCL_DECIDE_INPUT, number>().set(
		'complementary_occurrences_state',
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

const check_pending_occurrence_lists_state: NonFinalState<
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
> = {
	id: cdcl_stateName2StateId['check_pending_occurrence_lists_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: thereAreJobPostponed,
	transitions: new Map<CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT, number>()
		.set('pick_clause_set_state', cdcl_stateName2StateId['pick_clause_set_state'])
		.set('all_variables_assigned_state', cdcl_stateName2StateId['all_variables_assigned_state'])
};

const pick_clause_set_state: NonFinalState<CDCL_PICK_CLAUSE_SET_FUN, CDCL_PICK_CLAUSE_SET_INPUT> = {
	id: cdcl_stateName2StateId['pick_clause_set_state'],
	description: 'Get next pending clause set from the queue',
	run: pickPendingClauseSet,
	transitions: new Map<CDCL_PICK_CLAUSE_SET_INPUT, number>().set(
		'all_clauses_checked_state',
		cdcl_stateName2StateId['all_clauses_checked_state']
	)
};

const all_clauses_checked_state: NonFinalState<
	CDCL_ALL_CLAUSES_CHECKED_FUN,
	CDCL_ALL_CLAUSES_CHECKED_INPUT
> = {
	id: cdcl_stateName2StateId['all_clauses_checked_state'],
	description:
		'True if the postponed set of clauses still contain clauses to check, otherwise false',
	run: allClausesChecked,
	transitions: new Map<CDCL_ALL_CLAUSES_CHECKED_INPUT, number>()
		.set('next_clause_state', cdcl_stateName2StateId['next_clause_state'])
		.set('unstack_occurrence_list_state', cdcl_stateName2StateId['unstack_occurrence_list_state'])
};

const next_clause_state: NonFinalState<CDCL_NEXT_CLAUSE_FUN, CDCL_NEXT_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause to deal with',
	run: nextClause,
	transitions: new Map<CDCL_NEXT_CLAUSE_INPUT, number>().set(
		'conflict_detection_state',
		cdcl_stateName2StateId['conflict_detection_state']
	)
};

const conflict_detection_state: NonFinalState<
	CDCL_CONFLICT_DETECTION_FUN,
	CDCL_CONFLICT_DETECTION_INPUT
> = {
	id: cdcl_stateName2StateId['conflict_detection_state'],
	run: unsatisfiedClause,
	description: 'Check if current clause is unsatisfied',
	transitions: new Map<CDCL_CONFLICT_DETECTION_INPUT, number>()
		.set('unit_clause_state', cdcl_stateName2StateId['unit_clause_state'])
		.set('empty_occurrence_lists_state', cdcl_stateName2StateId['empty_clause_set_state'])
};

const unit_clause_state: NonFinalState<CDCL_UNIT_CLAUSE_FUN, CDCL_UNIT_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<CDCL_UNIT_CLAUSE_INPUT, number>()
		.set('delete_clause_state', cdcl_stateName2StateId['delete_clause_state'])
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
		'complementary_occurrences_state',
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
		'queue_occurrence_list_state',
		cdcl_stateName2StateId['queue_occurrence_list_state']
	)
};

const queue_occurrence_list_state: NonFinalState<
	CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	CDCL_QUEUE_OCCURRENCE_LIST_INPUT
> = {
	id: cdcl_stateName2StateId['queue_occurrence_list_state'],
	run: queueClauseSet,
	description: 'Stack an occurrence list as pending',
	transitions: new Map<CDCL_QUEUE_OCCURRENCE_LIST_INPUT, number>()
		.set('check_pending_occurrence_lists_state', cdcl_stateName2StateId['check_pending_occurrence_lists_state'])
		.set('delete_clause_state', cdcl_stateName2StateId['delete_clause_state'])
};

const unstack_occurrence_list_state: NonFinalState<
	CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
	CDCL_UNSTACK_OCCURRENCE_LIST_INPUT
> = {
	id: cdcl_stateName2StateId['unstack_occurrence_list_state'],
	run: unstackClauseSet,
	description: 'Unstack the set of clause',
	transitions: new Map<CDCL_UNSTACK_OCCURRENCE_LIST_INPUT, number>().set(
		'check_pending_clauses_state',
		cdcl_stateName2StateId['check_pending_occurrence_lists_state']
	)
};

const delete_clause_state: NonFinalState<CDCL_DELETE_CLAUSE_FUN, CDCL_DELETE_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['delete_clause_state'],
	run: deleteClause,
	description: `Deletes the clause that has been analyzed`,
	transitions: new Map<CDCL_DELETE_CLAUSE_INPUT, number>().set(
		'all_clauses_checked_state',
		cdcl_stateName2StateId['all_clauses_checked_state']
	)
};

const decision_level_state: NonFinalState<
	CDCL_CHECK_NON_DECISION_MADE_FUN,
	CDCL_CHECK_NON_DECISION_MADE_INPUT
> = {
	id: cdcl_stateName2StateId['decision_level_state'],
	run: nonDecisionMade,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<CDCL_CHECK_NON_DECISION_MADE_INPUT, number>()
		.set('build_conflict_analysis_state', cdcl_stateName2StateId['build_conflict_analysis_state'])
		.set('unsat_state', cdcl_stateName2StateId['unsat_state'])
};

const empty_clause_set_state: NonFinalState<
	CDCL_EMPTY_OCCURRENCE_LISTS_FUN,
	CDCL_EMPTY_OCCURRENCE_LISTS_INPUT
> = {
	id: cdcl_stateName2StateId['empty_clause_set_state'],
	run: emptyClauseSet,
	description: `Empties the queue of occurrence lists to check`,
	transitions: new Map<CDCL_EMPTY_OCCURRENCE_LISTS_INPUT, number>().set(
		'decision_level_state',
		cdcl_stateName2StateId['decision_level_state']
	)
};

// ** additional states from cdcl **

const build_conflict_analysis_state: NonFinalState<
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
> = {
	id: cdcl_stateName2StateId['build_conflict_analysis_state'],
	run: buildConflictAnalysis,
	description: `Buidls the Conflict Analysis Structure`,
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
		.set('pick_last_assignment_state', cdcl_stateName2StateId['pick_last_assignment_state'])
};

const pick_last_assignment_state: NonFinalState<
	CDCL_PICK_LAST_ASSIGNMENT_FUN,
	CDCL_PICK_LAST_ASSIGNMENT_INPUT
> = {
	id: cdcl_stateName2StateId['pick_last_assignment_state'],
	run: pickLastAssignment,
	description: `Picks the last assignment from the trail`,
	transitions: new Map<CDCL_PICK_LAST_ASSIGNMENT_INPUT, number>().set(
		'variable_in_cc_state',
		cdcl_stateName2StateId['variable_in_cc_state']
	)
};

const variable_in_cc_state: NonFinalState<CDCL_VARIABLE_IN_CC_FUN, CDCL_VARIABLE_IN_CC_INPUT> = {
	id: cdcl_stateName2StateId['variable_in_cc_state'],
	run: variableInCC,
	description: `Picks the last assignment from the trail`,
	transitions: new Map<CDCL_VARIABLE_IN_CC_INPUT, number>()
		.set('resolution_update_cc_state', cdcl_stateName2StateId['resolution_update_cc_state'])
		.set('delete_last_assignment_state', cdcl_stateName2StateId['delete_last_assignment_state'])
};

const resolution_update_cc_state: NonFinalState<
	CDCL_RESOLUTION_UPDATE_CC_FUN,
	CDCL_RESOLUTION_UPDATE_CC_INPUT
> = {
	id: cdcl_stateName2StateId['resolution_update_cc_state'],
	run: resolutionUpdateCC,
	description: `Resoultion rule is applyed and Conclict clause is updated`,
	transitions: new Map<CDCL_RESOLUTION_UPDATE_CC_INPUT, number>().set(
		'delete_last_assignment_state',
		cdcl_stateName2StateId['delete_last_assignment_state']
	)
};

const delete_last_assignment_state: NonFinalState<
	CDCL_DELETE_LAST_ASSIGNMENT_FUN,
	CDCL_DELETE_LAST_ASSIGNMENT_INPUT
> = {
	id: cdcl_stateName2StateId['delete_last_assignment_state'],
	run: deleteLastAssignment,
	description: `Deletes the last assignment from the trail`,
	transitions: new Map<CDCL_DELETE_LAST_ASSIGNMENT_INPUT, number>().set(
		'asserting_clause_state',
		cdcl_stateName2StateId['asserting_clause_state']
	)
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
	run: secondHighestDL,
	description: `Gets the second highst decision level`,
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
		'propagate_cc_state',
		cdcl_stateName2StateId['propagate_cc_state']
	)
};

const propagate_cc_state: NonFinalState<CDCL_PROPAGATE_CC_FUN, CDCL_PROPAGATE_CC_INPUT> = {
	id: cdcl_stateName2StateId['propagate_cc_state'],
	run: propagateCC,
	description: `Pushes the trail that needs to be learned`,
	transitions: new Map<CDCL_PROPAGATE_CC_INPUT, number>().set(
		'complementary_occurrences_state',
		cdcl_stateName2StateId['complementary_occurrences_state']
	)
};

// *** adding states to the set of states ***
export const states: Map<number, State<CDCL_FUN, CDCL_INPUT>> = new Map();

states.set(empty_clause_state.id, empty_clause_state);
states.set(unit_clauses_detection_state.id, unit_clauses_detection_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(check_pending_occurrence_lists_state.id, check_pending_occurrence_lists_state);
states.set(queue_occurrence_list_state.id, queue_occurrence_list_state);
states.set(pick_clause_set_state.id, pick_clause_set_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(unstack_occurrence_list_state.id, unstack_occurrence_list_state);
states.set(next_clause_state.id, next_clause_state);
states.set(all_clauses_checked_state.id, all_clauses_checked_state);
states.set(conflict_detection_state.id, conflict_detection_state);
states.set(delete_clause_state.id, delete_clause_state);
states.set(unit_clause_state.id, unit_clause_state);
states.set(unit_propagation_state.id, unit_propagation_state);
states.set(complementary_occurrences_state.id, complementary_occurrences_state);
states.set(decision_level_state.id, decision_level_state);
states.set(empty_clause_set_state.id, empty_clause_set_state);
states.set(build_conflict_analysis_state.id, build_conflict_analysis_state);
states.set(asserting_clause_state.id, asserting_clause_state);
states.set(pick_last_assignment_state.id, pick_last_assignment_state);
states.set(variable_in_cc_state.id, variable_in_cc_state);
states.set(resolution_update_cc_state.id, resolution_update_cc_state);
states.set(delete_last_assignment_state.id, delete_last_assignment_state);
states.set(learn_cc_state.id, learn_cc_state);
states.set(second_highest_dl_state.id, second_highest_dl_state);
states.set(undo_trail_to_shdl_state.id, undo_trail_to_shdl_state);
states.set(push_trail_state.id, push_trail_state);
states.set(propagate_cc_state.id, propagate_cc_state);

// export initial node
export const initial = empty_clause_state.id;

// export conflict node
export const conflict = pick_last_assignment_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;
