import type { FinalState, NonFinalState, State } from '../StateMachine.ts';
import { SAT_STATE_ID, UNSAT_STATE_ID } from '../reserved.ts';
import {
	allAssigned,
	emptyClauseDetection,
	nextClause,
	queueClauseSet,
	triggeredClauses,
	unitClauseDetection,
	unstackClauseSet,
	type DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	type DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	type DPLL_CONFLICT_DETECTION_FUN,
	type DPLL_EMPTY_CLAUSE_FUN,
	type DPLL_EMPTY_CLAUSE_INPUT,
	type DPLL_FUN,
	type DPLL_INPUT,
	type DPLL_PEEK_CLAUSE_SET_FUN,
	type DPLL_PEEK_CLAUSE_SET_INPUT,
	type DPLL_QUEUE_CLAUSE_SET_FUN,
	type DPLL_QUEUE_CLAUSE_SET_INPUT,
	type DPLL_TRIGGERED_CLAUSES_FUN,
	type DPLL_TRIGGERED_CLAUSES_INPUT,
	type DPLL_UNIT_CLAUSES_DETECTION_FUN,
	type DPLL_UNIT_CLAUSES_DETECTION_INPUT,
	type DPLL_UNSTACK_CLAUSE_SET_FUN,
	type DPLL_UNSTACK_CLAUSE_SET_INPUT,
	peekPendingClauseSet,
	type DPLL_ALL_CLAUSES_CHECKED_INPUT,
	type DPLL_ALL_CLAUSES_CHECKED_FUN,
	allClausesChecked,
	type DPLL_NEXT_CLAUSE_FUN,
	type DPLL_NEXT_CLAUSE_INPUT,
	type DPLL_CONFLICT_DETECTION_INPUT,
	unsatisfiedClause,
	type DPLL_CHECK_PENDING_CLAUSES_INPUT,
	type DPLL_CHECK_PENDING_CLAUSES_FUN,
	thereAreJobPostponed,
	type DPLL_DELETE_CLAUSE_FUN,
	type DPLL_DELETE_CLAUSE_INPUT,
	deleteClause,
	type DPLL_UNIT_CLAUSE_DETECTION_FUN,
	type DPLL_UNIT_CLAUSE_DETECTION_INPUT,
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
	unitClause
} from './dpll-domain.ts';

export const dpll_stateName2StateId = {
	sat_state: SAT_STATE_ID,
	unsat_state: UNSAT_STATE_ID,
	empty_clause_state: 0,
	unit_clauses_detection_state: 1,
	triggered_clauses_state: 2,
	queue_clause_set_state: 3,
	check_pending_clauses_state: 4,
	peek_clause_set_state: 5,
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
	check_non_decision_made_state: 16,
	backtracking_state: 17,
	decide_state: 18
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
		'triggered_clauses_state',
		dpll_stateName2StateId['triggered_clauses_state']
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

const check_pending_clauses_state: NonFinalState<
	DPLL_CHECK_PENDING_CLAUSES_FUN,
	DPLL_CHECK_PENDING_CLAUSES_INPUT
> = {
	id: dpll_stateName2StateId['check_pending_clauses_state'],
	description: 'True if there are set of clauses postponed, false otherwise',
	run: thereAreJobPostponed,
	transitions: new Map<DPLL_CHECK_PENDING_CLAUSES_INPUT, number>()
		.set('peek_clause_set_state', dpll_stateName2StateId['peek_clause_set_state'])
		.set('all_variables_assigned_state', dpll_stateName2StateId['all_variables_assigned_state'])
};

const peek_clause_set_state: NonFinalState<DPLL_PEEK_CLAUSE_SET_FUN, DPLL_PEEK_CLAUSE_SET_INPUT> = {
	id: dpll_stateName2StateId['peek_clause_set_state'],
	description: 'Get next pending clause set from the queue',
	run: peekPendingClauseSet,
	transitions: new Map<DPLL_PEEK_CLAUSE_SET_INPUT, number>().set(
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
		'True if the postponed set of clauses still contain clauses to check, otherwise false',
	run: allClausesChecked,
	transitions: new Map<DPLL_ALL_CLAUSES_CHECKED_INPUT, number>()
		.set('next_clause_state', dpll_stateName2StateId['next_clause_state'])
		.set('unstack_clause_set_state', dpll_stateName2StateId['unstack_clause_set_state'])
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
		.set('decision_level_state', dpll_stateName2StateId['check_non_decision_made_state'])
};

const unit_clause_state: NonFinalState<
	DPLL_UNIT_CLAUSE_DETECTION_FUN,
	DPLL_UNIT_CLAUSE_DETECTION_INPUT
> = {
	id: dpll_stateName2StateId['unit_clause_state'],
	run: unitClause,
	description: 'Check if current clause is unit',
	transitions: new Map<DPLL_UNIT_CLAUSE_DETECTION_INPUT, number>()
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
		'triggered_clauses_state',
		dpll_stateName2StateId['triggered_clauses_state']
	)
};

const queue_clause_set_state: NonFinalState<
	DPLL_QUEUE_CLAUSE_SET_FUN,
	DPLL_QUEUE_CLAUSE_SET_INPUT
> = {
	id: dpll_stateName2StateId['queue_clause_set_state'],
	run: queueClauseSet,
	description: 'Stack a set of clause as pending',
	transitions: new Map<DPLL_QUEUE_CLAUSE_SET_INPUT, number>()
		.set('check_pending_clauses_state', dpll_stateName2StateId['check_pending_clauses_state'])
		.set('delete_clause_state', dpll_stateName2StateId['delete_clause_state'])
};

const triggered_clauses_state: NonFinalState<
	DPLL_TRIGGERED_CLAUSES_FUN,
	DPLL_TRIGGERED_CLAUSES_INPUT
> = {
	id: dpll_stateName2StateId['triggered_clauses_state'],
	run: triggeredClauses,
	description: 'Checks if last assignment added clauses to revise',
	transitions: new Map<DPLL_TRIGGERED_CLAUSES_INPUT, number>()
		.set('queue_clause_set_state', dpll_stateName2StateId['queue_clause_set_state'])
		.set('all_variables_assigned_state', dpll_stateName2StateId['all_variables_assigned_state'])
		.set('delete_clause_state', dpll_stateName2StateId['delete_clause_state'])
};

const unstack_clause_set_state: NonFinalState<
	DPLL_UNSTACK_CLAUSE_SET_FUN,
	DPLL_UNSTACK_CLAUSE_SET_INPUT
> = {
	id: dpll_stateName2StateId['unstack_clause_set_state'],
	run: unstackClauseSet,
	description: 'Unstack the set of clause',
	transitions: new Map<DPLL_UNSTACK_CLAUSE_SET_INPUT, number>().set(
		'check_state',
		dpll_stateName2StateId['clause_evaluation_state']
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

const check_non_decision_made_state: NonFinalState<
	DPLL_CHECK_NON_DECISION_MADE_FUN,
	DPLL_CHECK_NON_DECISION_MADE_INPUT
> = {
	id: dpll_stateName2StateId['check_non_decision_made_state'],
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

// *** adding states to the set of states ***
export const states: Map<number, State<DPLL_FUN, DPLL_INPUT>> = new Map();

states.set(empty_clause_state.id, empty_clause_state);
states.set(unit_clauses_detection_state.id, unit_clauses_detection_state);
states.set(unsat_state.id, unsat_state);
states.set(sat_state.id, sat_state);
states.set(check_pending_clauses_state.id, check_pending_clauses_state);
states.set(queue_clause_set_state.id, queue_clause_set_state);
states.set(peek_clause_set_state.id, peek_clause_set_state);
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
states.set(check_non_decision_made_state.id, check_non_decision_made_state);
states.set(backtracking_state.id, backtracking_state);

// export initial node
export const initial = empty_clause_state.id;
