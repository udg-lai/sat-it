import type { FinalState, NonFinalState, State } from '../StateMachine.svelte.ts';
import {
	BACKTRACKING_STATE_ID,
	DECIDE_STATE_ID,
	SAT_STATE_ID,
	UNSAT_STATE_ID
} from '../reserved.ts';
import {
	allAssigned,
	emptyClauseDetection,
	nextClause,
	queueOccurrenceList,
	unitClauseDetection,
	unstackOccurrenceList,
	type DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	type DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	type DPLL_CONFLICT_DETECTION_FUN,
	type DPLL_EMPTY_CLAUSE_FUN,
	type DPLL_EMPTY_CLAUSE_INPUT,
	type DPLL_FUN,
	type DPLL_INPUT,
	type DPLL_PICK_CLAUSE_SET_FUN,
	type DPLL_PICK_CLAUSE_SET_INPUT,
	type DPLL_QUEUE_OCCURRENCE_LIST_FUN,
	type DPLL_QUEUE_OCCURRENCE_LIST_INPUT,
	type DPLL_UNIT_CLAUSES_DETECTION_FUN,
	type DPLL_UNIT_CLAUSES_DETECTION_INPUT,
	type DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
	type DPLL_UNSTACK_CLAUSE_SET_INPUT,
	pickClauseSet,
	type DPLL_ALL_CLAUSES_CHECKED_INPUT,
	type DPLL_ALL_CLAUSES_CHECKED_FUN,
	allClausesChecked,
	type DPLL_NEXT_CLAUSE_FUN,
	type DPLL_NEXT_CLAUSE_INPUT,
	type DPLL_CONFLICT_DETECTION_INPUT,
	unsatisfiedClause,
	type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	type DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	thereAreJobPostponed,
	type DPLL_DELETE_CLAUSE_FUN,
	type DPLL_DELETE_CLAUSE_INPUT,
	deleteClause,
	type DPLL_UNIT_CLAUSE_FUN as DPLL_UNIT_CLAUSE_FUN,
	type DPLL_UNIT_CLAUSE_INPUT as DPLL_UNIT_CLAUSE_INPUT,
	type DPLL_UNIT_PROPAGATION_FUN,
	type DPLL_UNIT_PROPAGATION_INPUT,
	unitPropagation,
	type DPLL_COMPLEMENTARY_OCCURRENCES_INPUT,
	type DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	complementaryOccurrences,
	nonDecisionMade,
	type DPLL_CHECK_NON_DECISION_MADE_FUN,
	type DPLL_CHECK_NON_DECISION_MADE_INPUT,
	type DPLL_BACKTRACKING_FUN,
	type DPLL_BACKTRACKING_INPUT,
	backtracking,
	type DPLL_DECIDE_FUN,
	type DPLL_DECIDE_INPUT,
	decide,
	unitClause,
	type DPLL_EMPTY_OCCURRENCE_LISTS_FUN,
	type DPLL_EMPTY_OCCURRENCE_LISTS_INPUT,
	emptyOccurrenceLists
} from './dpll-domain.svelte.ts';

export const dpll_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
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
	backtracking_state: BACKTRACKING_STATE_ID,
	decide_state: DECIDE_STATE_ID,
	empty_occurrence_lists_state: 16
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

const unit_clauses_detection_state: NonFinalState<
	DPLL_UNIT_CLAUSES_DETECTION_FUN,
	DPLL_UNIT_CLAUSES_DETECTION_INPUT
> = {
	id: dpll_stateName2StateId['unit_clauses_detection_state'],
	run: unitClauseDetection,
	description: 'Seeks for the problem s unit clauses',
	transitions: new Map<DPLL_UNIT_CLAUSES_DETECTION_INPUT, number>().set(
		'queue_occurrence_list_state',
		dpll_stateName2StateId['queue_occurrence_list_state']
	)
};

const empty_clause_state: NonFinalState<DPLL_EMPTY_CLAUSE_FUN, DPLL_EMPTY_CLAUSE_INPUT> = {
	id: dpll_stateName2StateId['empty_clause_state'],
	run: emptyClauseDetection,
	description: 'Seeks for the empty clause in the clause pool',
	transitions: new Map<DPLL_EMPTY_CLAUSE_INPUT, number>()
		.set('unit_clauses_detection_state', dpll_stateName2StateId['unit_clauses_detection_state'])
		.set('unsat_state', dpll_stateName2StateId['unsat_state'])
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

const check_pending_occurrence_lists_state: NonFinalState<
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
> = {
	id: dpll_stateName2StateId['check_pending_occurrence_lists_state'],
	description: 'True if there are occurrence lists postponed, false otherwise',
	run: thereAreJobPostponed,
	transitions: new Map<DPLL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT, number>()
		.set('pick_clause_set_state', dpll_stateName2StateId['pick_clause_set_state'])
		.set('all_variables_assigned_state', dpll_stateName2StateId['all_variables_assigned_state'])
};

const pick_clause_set_state: NonFinalState<DPLL_PICK_CLAUSE_SET_FUN, DPLL_PICK_CLAUSE_SET_INPUT> = {
	id: dpll_stateName2StateId['pick_clause_set_state'],
	description: 'Get next pending clause set from the queue',
	run: pickClauseSet,
	transitions: new Map<DPLL_PICK_CLAUSE_SET_INPUT, number>().set(
		'all_clauses_checked_state',
		dpll_stateName2StateId['all_clauses_checked_state']
	)
};

const all_clauses_checked_state: NonFinalState<
	DPLL_ALL_CLAUSES_CHECKED_FUN,
	DPLL_ALL_CLAUSES_CHECKED_INPUT
> = {
	id: dpll_stateName2StateId['all_clauses_checked_state'],
	description:
		'True if the postponed occurrence list still contain clauses to check, otherwise false',
	run: allClausesChecked,
	transitions: new Map<DPLL_ALL_CLAUSES_CHECKED_INPUT, number>()
		.set('next_clause_state', dpll_stateName2StateId['next_clause_state'])
		.set('unstack_clause_set_state', dpll_stateName2StateId['unstack_occurrence_list_state'])
};

const next_clause_state: NonFinalState<DPLL_NEXT_CLAUSE_FUN, DPLL_NEXT_CLAUSE_INPUT> = {
	id: dpll_stateName2StateId['next_clause_state'],
	description: 'Returns the next clause to deal with',
	run: nextClause,
	transitions: new Map<DPLL_NEXT_CLAUSE_INPUT, number>().set(
		'conflict_detection_state',
		dpll_stateName2StateId['conflict_detection_state']
	)
};

const conflict_detection_state: NonFinalState<
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT
> = {
	id: dpll_stateName2StateId['conflict_detection_state'],
	run: unsatisfiedClause,
	description: 'Check if current clause is unsatisfied',
	transitions: new Map<DPLL_CONFLICT_DETECTION_INPUT, number>()
		.set('unit_clause_state', dpll_stateName2StateId['unit_clause_state'])
		.set('empty_occurrence_lists_state', dpll_stateName2StateId['empty_occurrence_lists_state'])
};

const unit_clause_state: NonFinalState<DPLL_UNIT_CLAUSE_FUN, DPLL_UNIT_CLAUSE_INPUT> = {
	id: dpll_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<DPLL_UNIT_CLAUSE_INPUT, number>()
		.set('delete_clause_state', dpll_stateName2StateId['delete_clause_state'])
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
			'check_pending_occurrence_lists_state',
			dpll_stateName2StateId['check_pending_occurrence_lists_state']
		)
		.set('delete_clause_state', dpll_stateName2StateId['delete_clause_state'])
};

const unstack_occurrence_list_state: NonFinalState<
	DPLL_UNSTACK_OCCURRENCE_LIST_FUN,
	DPLL_UNSTACK_CLAUSE_SET_INPUT
> = {
	id: dpll_stateName2StateId['unstack_occurrence_list_state'],
	run: unstackOccurrenceList,
	description: 'Unstack the set of clause',
	transitions: new Map<DPLL_UNSTACK_CLAUSE_SET_INPUT, number>().set(
		'check_pending_occurrence_lists_state',
		dpll_stateName2StateId['check_pending_occurrence_lists_state']
	)
};

const delete_clause_state: NonFinalState<DPLL_DELETE_CLAUSE_FUN, DPLL_DELETE_CLAUSE_INPUT> = {
	id: dpll_stateName2StateId['delete_clause_state'],
	run: deleteClause,
	description: `Deletes the clause that has been analyzed`,
	transitions: new Map<DPLL_DELETE_CLAUSE_INPUT, number>().set(
		'all_clauses_checked_state',
		dpll_stateName2StateId['all_clauses_checked_state']
	)
};

const decision_level_state: NonFinalState<
	DPLL_CHECK_NON_DECISION_MADE_FUN,
	DPLL_CHECK_NON_DECISION_MADE_INPUT
> = {
	id: dpll_stateName2StateId['decision_level_state'],
	run: nonDecisionMade,
	description: `Check if decision level of the latest trail is === 0`,
	transitions: new Map<DPLL_CHECK_NON_DECISION_MADE_INPUT, number>()
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

const empty_occurrence_lists_state: NonFinalState<
	DPLL_EMPTY_OCCURRENCE_LISTS_FUN,
	DPLL_EMPTY_OCCURRENCE_LISTS_INPUT
> = {
	id: dpll_stateName2StateId['empty_occurrence_lists_state'],
	run: emptyOccurrenceLists,
	description: `Empties the queue occurrence lists to check`,
	transitions: new Map<DPLL_EMPTY_OCCURRENCE_LISTS_INPUT, number>().set(
		'decision_level_state',
		dpll_stateName2StateId['decision_level_state']
	)
};

// *** adding states to the set of states ***
export const states: Map<number, State<DPLL_FUN, DPLL_INPUT>> = new Map();

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
states.set(backtracking_state.id, backtracking_state);
states.set(empty_occurrence_lists_state.id, empty_occurrence_lists_state);

// export initial node
export const initial = empty_clause_state.id;

export const preConflict = all_clauses_checked_state.id;

export const conflict = empty_occurrence_lists_state.id;

export const sat = sat_state.id;

export const unsat = unsat_state.id;
