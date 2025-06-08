import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import { DECIDE_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	allAssigned,
	emptyClauseDetection,
	nextClause,
	queueClauseSet,
	triggeredClauses,
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
	type CDCL_QUEUE_CLAUSE_SET_FUN,
	type CDCL_QUEUE_CLAUSE_SET_INPUT,
	type CDCL_TRIGGERED_CLAUSES_FUN,
	type CDCL_TRIGGERED_CLAUSES_INPUT,
	type CDCL_UNIT_CLAUSES_DETECTION_FUN,
	type CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	type CDCL_UNSTACK_CLAUSE_SET_FUN,
	type CDCL_UNSTACK_CLAUSE_SET_INPUT,
	pickPendingClauseSet,
	type CDCL_ALL_CLAUSES_CHECKED_INPUT,
	type CDCL_ALL_CLAUSES_CHECKED_FUN,
	allClausesChecked,
	type CDCL_NEXT_CLAUSE_FUN,
	type CDCL_NEXT_CLAUSE_INPUT,
	type CDCL_CONFLICT_DETECTION_INPUT,
	unsatisfiedClause,
	type CDCL_CHECK_PENDING_CLAUSES_INPUT,
	type CDCL_CHECK_PENDING_CLAUSES_FUN,
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
	type CDCL_EMPTY_CLAUSE_SET_FUN,
	type CDCL_EMPTY_CLAUSE_SET_INPUT,
	emptyClauseSet,
	type CDLC_BUILD_FUIP_STRUCTURE_INPUT,
	type CDLC_BUILD_FUIP_STRUCTURE_FUN,
	buildFUIP,
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
  type CDCL_LEARN_CONCLICT_CLAUSE_FUN,
  type CDCL_LEARN_CONCLICT_CLAUSE_INPUT
} from './cdcl-domain.svelte.ts';

export const cdcl_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	empty_clause_state: 0,
	unit_clauses_detection_state: 1,
	triggered_clauses_state: 2,
	queue_clause_set_state: 3,
	check_pending_clauses_state: 4,
	pick_clause_set_state: 5,
	all_variables_assigned_state: 6,
	unstack_clause_set_state: 7,
	clause_evaluation_state: 8,
	all_clauses_checked_state: 9,
	next_clause_state: 10,
	conflict_detection_state: 11,
	unit_clause_state: 12,
	delete_clause_state: 13,
	unit_propagation_state: 14,
	complementary_occurrences_state: 15,
	decision_level_state: 16,
	empty_clause_set_state: 17,
	build_fuip_state: 18,
	asserting_clause_state: 19,
	pick_last_assignment_state: 20,
	variable_in_cc_state: 21,
	resolution_update_cc_state: 22,
	delete_last_assignment_state: 23,
	learn_cc_state: 24,
  backjumping_state: 25
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
		'triggered_clauses_state',
		cdcl_stateName2StateId['triggered_clauses_state']
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

const check_pending_clauses_state: NonFinalState<
	CDCL_CHECK_PENDING_CLAUSES_FUN,
	CDCL_CHECK_PENDING_CLAUSES_INPUT
> = {
	id: cdcl_stateName2StateId['check_pending_clauses_state'],
	description: 'True if there are set of clauses postponed, false otherwise',
	run: thereAreJobPostponed,
	transitions: new Map<CDCL_CHECK_PENDING_CLAUSES_INPUT, number>()
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
		.set('unstack_clause_set_state', cdcl_stateName2StateId['unstack_clause_set_state'])
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
		.set('empty_clause_set_state', cdcl_stateName2StateId['empty_clause_set_state'])
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
		'triggered_clauses_state',
		cdcl_stateName2StateId['triggered_clauses_state']
	)
};

const queue_clause_set_state: NonFinalState<
	CDCL_QUEUE_CLAUSE_SET_FUN,
	CDCL_QUEUE_CLAUSE_SET_INPUT
> = {
	id: cdcl_stateName2StateId['queue_clause_set_state'],
	run: queueClauseSet,
	description: 'Stack a set of clause as pending',
	transitions: new Map<CDCL_QUEUE_CLAUSE_SET_INPUT, number>()
		.set('check_pending_clauses_state', cdcl_stateName2StateId['check_pending_clauses_state'])
		.set('delete_clause_state', cdcl_stateName2StateId['delete_clause_state'])
};

const triggered_clauses_state: NonFinalState<
	CDCL_TRIGGERED_CLAUSES_FUN,
	CDCL_TRIGGERED_CLAUSES_INPUT
> = {
	id: cdcl_stateName2StateId['triggered_clauses_state'],
	run: triggeredClauses,
	description: 'Checks if last assignment added clauses to revise',
	transitions: new Map<CDCL_TRIGGERED_CLAUSES_INPUT, number>()
		.set('queue_clause_set_state', cdcl_stateName2StateId['queue_clause_set_state'])
		.set('all_variables_assigned_state', cdcl_stateName2StateId['all_variables_assigned_state'])
		.set('delete_clause_state', cdcl_stateName2StateId['delete_clause_state'])
};

const unstack_clause_set_state: NonFinalState<
	CDCL_UNSTACK_CLAUSE_SET_FUN,
	CDCL_UNSTACK_CLAUSE_SET_INPUT
> = {
	id: cdcl_stateName2StateId['unstack_clause_set_state'],
	run: unstackClauseSet,
	description: 'Unstack the set of clause',
	transitions: new Map<CDCL_UNSTACK_CLAUSE_SET_INPUT, number>().set(
		'check_pending_clauses_state',
		cdcl_stateName2StateId['check_pending_clauses_state']
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
		.set('build_fuip_state', cdcl_stateName2StateId['build_fuip_state'])
		.set('unsat_state', cdcl_stateName2StateId['unsat_state'])
};

const empty_clause_set_state: NonFinalState<
	CDCL_EMPTY_CLAUSE_SET_FUN,
	CDCL_EMPTY_CLAUSE_SET_INPUT
> = {
	id: cdcl_stateName2StateId['empty_clause_set_state'],
	run: emptyClauseSet,
	description: `Emties the queue of clauses to check`,
	transitions: new Map<CDCL_EMPTY_CLAUSE_SET_INPUT, number>().set(
		'decision_level_state',
		cdcl_stateName2StateId['decision_level_state']
	)
};

// ** additional states from cdcl **

const build_fuip_state: NonFinalState<
	CDLC_BUILD_FUIP_STRUCTURE_FUN,
	CDLC_BUILD_FUIP_STRUCTURE_INPUT
> = {
	id: cdcl_stateName2StateId['build_fuip_state'],
	run: buildFUIP,
	description: `Buidls the First Unique Implication Point Structure`,
	transitions: new Map<CDLC_BUILD_FUIP_STRUCTURE_INPUT, number>().set(
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

const resolution_update_cc_state: NonFinalState<CDCL_VARIABLE_IN_CC_FUN, CDCL_VARIABLE_IN_CC_INPUT> = {
	id: cdcl_stateName2StateId['resolution_update_cc_state'],
	run: variableInCC,
	description: `Resoultion rule is applyed and Conclict clause is updated`,
	transitions: new Map<CDCL_VARIABLE_IN_CC_INPUT, number>()
		.set('delete_last_assignment_state', cdcl_stateName2StateId['delete_last_assignment_state'])
};

const delete_last_assignment_state: NonFinalState<CDCL_DELETE_LAST_ASSIGNMENT_FUN, CDCL_DELETE_LAST_ASSIGNMENT_INPUT> = {
	id: cdcl_stateName2StateId['delete_last_assignment_state'],
	run: deleteLastAssignment,
	description: `Deletes the last assignment from the trail`,
	transitions: new Map<CDCL_DELETE_LAST_ASSIGNMENT_INPUT, number>()
		.set('asserting_clause_state', cdcl_stateName2StateId['asserting_clause_state'])
};

const learn_cc_state: NonFinalState<CDCL_LEARN_CONCLICT_CLAUSE_FUN, CDCL_LEARN_CONCLICT_CLAUSE_INPUT> = {
	id: cdcl_stateName2StateId['delete_last_assignment_state'],
	run: deleteLastAssignment,
	description: `Deletes the last assignment from the trail`,
	transitions: new Map<CDCL_LEARN_CONCLICT_CLAUSE_INPUT, number>()
		.set('backjumping_state', cdcl_stateName2StateId['backjumping_state'])
};

// *** adding states to the set of states ***
export const states: Map<number, State<CDCL_FUN, CDCL_INPUT>> = new Map();

states.set(empty_clause_state.id, empty_clause_state);
states.set(unit_clauses_detection_state.id, unit_clauses_detection_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(check_pending_clauses_state.id, check_pending_clauses_state);
states.set(queue_clause_set_state.id, queue_clause_set_state);
states.set(pick_clause_set_state.id, pick_clause_set_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(unstack_clause_set_state.id, unstack_clause_set_state);
states.set(triggered_clauses_state.id, triggered_clauses_state);
states.set(next_clause_state.id, next_clause_state);
states.set(all_clauses_checked_state.id, all_clauses_checked_state);
states.set(conflict_detection_state.id, conflict_detection_state);
states.set(delete_clause_state.id, delete_clause_state);
states.set(unit_clause_state.id, unit_clause_state);
states.set(unit_propagation_state.id, unit_propagation_state);
states.set(complementary_occurrences_state.id, complementary_occurrences_state);
states.set(decision_level_state.id, decision_level_state);
states.set(empty_clause_set_state.id, empty_clause_set_state);
states.set(build_fuip_state.id, build_fuip_state);
states.set(asserting_clause_state.id, asserting_clause_state);
states.set(pick_last_assignment_state.id, pick_last_assignment_state);
states.set(variable_in_cc_state.id, variable_in_cc_state);
states.set(resolution_update_cc_state.id, resolution_update_cc_state);
states.set(delete_last_assignment_state.id, delete_last_assignment_state);
states.set(learn_cc_state.id, learn_cc_state);
// export initial node
export const initial = empty_clause_state.id;

// export conflict node
export const conflict = pick_last_assignment_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;
