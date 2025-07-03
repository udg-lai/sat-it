import {
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	emptyClauseDetection as solverEmptyClauseDetection,
	nonDecisionMade as solverNonDecisionMade,
	unitClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation
} from '$lib/solvers/shared.svelte.ts';
import Clause, {
	isUnitClause,
	isUnSATClause,
	type ClauseEval
} from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import { isPropagationReason, type Reason } from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { updateClausesToCheck } from '$lib/states/conflict-detection-state.svelte.ts';
import {
	addClauseToClausePool,
	getClausePool,
	getProblemStore,
	type MappingLiteral2Clauses,
	type Problem
} from '$lib/states/problem.svelte.ts';
import { getLatestTrail, getTrails } from '$lib/states/trails.svelte.ts';
import { logFatal, logInfo } from '$lib/stores/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { OccurrenceList } from '../types.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import { unwrapEither, type Either } from '$lib/types/either.ts';

const problem: Problem = $derived(getProblemStore());

// ** state inputs **

export type CDCL_EMPTY_CLAUSE_INPUT = 'unit_clauses_detection_state' | 'unsat_state';

export type CDCL_UNIT_CLAUSES_DETECTION_INPUT = 'queue_occurrence_list_state';

export type CDCL_PICK_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT =
	| 'all_variables_assigned_state'
	| 'pick_clause_set_state';

export type CDCL_QUEUE_OCCURRENCE_LIST_INPUT =
	| 'check_pending_occurrence_lists_state'
	| 'delete_clause_state';

export type CDCL_UNSTACK_OCCURRENCE_LIST_INPUT = 'check_pending_occurrence_lists_state';

export type CDCL_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';

export type CDCL_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'unstack_occurrence_list_state';

export type CDCL_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type CDCL_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'empty_occurrence_lists_state';

export type CDCL_UNIT_CLAUSE_INPUT = 'delete_clause_state' | 'unit_propagation_state';

export type CDCL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type CDCL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type CDCL_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';

export type CDCL_CHECK_NON_DECISION_MADE_INPUT = 'build_conflict_analysis_state' | 'unsat_state';

export type CDCL_DECIDE_INPUT = 'complementary_occurrences_state';

export type CDCL_EMPTY_OCCURRENCE_LISTS_INPUT = 'decision_level_state';

//New CDCL Inputs

export type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT = 'asserting_clause_state';

export type CDCL_ASSERTING_CLAUSE_INPUT = 'learn_cc_state' | 'pick_last_assignment_state';

export type CDCL_PICK_LAST_ASSIGNMENT_INPUT = 'variable_in_cc_state';

export type CDCL_VARIABLE_IN_CC_INPUT =
	| 'resolution_update_cc_state'
	| 'delete_last_assignment_state';

export type CDCL_RESOLUTION_UPDATE_CC_INPUT = 'delete_last_assignment_state';

export type CDCL_DELETE_LAST_ASSIGNMENT_INPUT = 'asserting_clause_state';

export type CDCL_LEARN_CONFLICT_CLAUSE_INPUT = 'second_highest_dl_state';

export type CDCL_SECOND_HIGHEST_DL_INPUT = 'undo_backjumping_state';

export type CDCL_BACKJUMPING_INPUT = 'push_trail_state';

export type CDCL_PUSH_TRAIL_INPUT = 'propagate_cc_state';

export type CDCL_PROPAGATE_CC_INPUT = 'complementary_occurrences_state';

export type CDCL_INPUT =
	| CDCL_EMPTY_CLAUSE_INPUT
	| CDCL_UNIT_CLAUSES_DETECTION_INPUT
	| CDCL_PICK_CLAUSE_SET_INPUT
	| CDCL_ALL_VARIABLES_ASSIGNED_INPUT
	| CDCL_QUEUE_OCCURRENCE_LIST_INPUT
	| CDCL_UNSTACK_OCCURRENCE_LIST_INPUT
	| CDCL_ALL_CLAUSES_CHECKED_INPUT
	| CDCL_NEXT_CLAUSE_INPUT
	| CDCL_CONFLICT_DETECTION_INPUT
	| CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	| CDCL_DELETE_CLAUSE_INPUT
	| CDCL_UNIT_CLAUSE_INPUT
	| CDCL_UNIT_PROPAGATION_INPUT
	| CDCL_COMPLEMENTARY_OCCURRENCES_INPUT
	| CDCL_CHECK_NON_DECISION_MADE_INPUT
	| CDCL_DECIDE_INPUT
	| CDCL_EMPTY_OCCURRENCE_LISTS_INPUT
	| CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	| CDCL_ASSERTING_CLAUSE_INPUT
	| CDCL_PICK_LAST_ASSIGNMENT_INPUT
	| CDCL_VARIABLE_IN_CC_INPUT
	| CDCL_RESOLUTION_UPDATE_CC_INPUT
	| CDCL_DELETE_LAST_ASSIGNMENT_INPUT
	| CDCL_LEARN_CONFLICT_CLAUSE_INPUT
	| CDCL_SECOND_HIGHEST_DL_INPUT
	| CDCL_BACKJUMPING_INPUT
	| CDCL_PUSH_TRAIL_INPUT
	| CDCL_PROPAGATE_CC_INPUT;

// ** state functions **

export type CDCL_DECIDE_FUN = () => number;

export const decide: CDCL_DECIDE_FUN = () => {
	const pool: VariablePool = problem.variables;
	return solverDecide(pool, 'cdcl');
};

export type CDCL_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: CDCL_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = problem.variables;
	return solverAllAssigned(pool);
};

export type CDCL_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: CDCL_EMPTY_CLAUSE_FUN = () => {
	const pool: ClausePool = problem.clauses;
	return solverEmptyClauseDetection(pool);
};

export type CDCL_QUEUE_OCCURRENCE_LIST_FUN = (
	variable: number,
	clauses: SvelteSet<number>,
	solverStateMachine: CDCL_SolverMachine
) => number;

export const queueClauseSet: CDCL_QUEUE_OCCURRENCE_LIST_FUN = (
	variable: number,
	clauses: SvelteSet<number>,
	solverStateMachine: CDCL_SolverMachine
) => {
	const occurrenceList: OccurrenceList = { clauses: clauses, variableReasonId: variable };
	solverStateMachine.postpone(occurrenceList);
	return solverStateMachine.leftToPostpone();
};

export type CDCL_UNSTACK_OCCURRENCE_LIST_FUN = (solverStateMachine: CDCL_SolverMachine) => void;

export const unstackClauseSet: CDCL_UNSTACK_OCCURRENCE_LIST_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	return solverStateMachine.resolvePostponed();
};

export type CDCL_UNIT_CLAUSES_DETECTION_FUN = () => SvelteSet<number>;

export const unitClauseDetection: CDCL_UNIT_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = problem.clauses;
	return solverUnitClauseDetection(pool);
};

export type CDCL_DELETE_CLAUSE_FUN = (clauses: SvelteSet<number>, clauseTag: number) => void;

export const deleteClause: CDCL_DELETE_CLAUSE_FUN = (
	clauses: SvelteSet<number>,
	clauseTag: number
) => {
	if (!clauses.has(clauseTag)) {
		logFatal('Clause not found', `Clause - ${clauseTag} not found`);
	}
	clauses.delete(clauseTag);
};

export type CDCL_PICK_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => SvelteSet<number>;

export const pickPendingClauseSet: CDCL_PICK_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	const occurrenceList: OccurrenceList = solverStateMachine.consultPostponed();
	updateClausesToCheck(occurrenceList.clauses, occurrenceList.variableReasonId);
	return occurrenceList.clauses;
};

export type CDCL_ALL_CLAUSES_CHECKED_FUN = (clauses: SvelteSet<number>) => boolean;

export const allClausesChecked: CDCL_ALL_CLAUSES_CHECKED_FUN = (clauses: SvelteSet<number>) => {
	return clauses.size === 0;
};

export type CDCL_NEXT_CLAUSE_FUN = (clauses: SvelteSet<number>) => number;

export const nextClause: CDCL_NEXT_CLAUSE_FUN = (clauses: SvelteSet<number>) => {
	if (clauses.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = clauses.values().next();
	const clauseTag = clausesIterator.value;
	return clauseTag as number;
};

export type CDCL_CONFLICT_DETECTION_FUN = (clauseTag: number) => boolean;

export const unsatisfiedClause: CDCL_CONFLICT_DETECTION_FUN = (clauseTag: number) => {
	const pool: ClausePool = problem.clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseTag);
	return isUnSATClause(evaluation);
};

export type CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => boolean;

export const thereAreJobPostponed: CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	return solverStateMachine.thereArePostponed();
};

export type CDCL_UNIT_CLAUSE_FUN = (clauseTag: number) => boolean;

export const unitClause: CDCL_UNIT_CLAUSE_FUN = (clauseTag: number) => {
	const pool: ClausePool = problem.clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseTag);
	return isUnitClause(evaluation);
};

export type CDCL_UNIT_PROPAGATION_FUN = (clauseTag: number) => number;

export const unitPropagation: CDCL_UNIT_PROPAGATION_FUN = (clauseTag: number) => {
	const variables: VariablePool = problem.variables;
	const clauses: ClausePool = problem.clauses;
	return solverUnitPropagation(variables, clauses, clauseTag, 'up');
};

export type CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => SvelteSet<number>;

export const complementaryOccurrences: CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: MappingLiteral2Clauses = problem.mapping;
	return solverComplementaryOccurrences(mapping, literal);
};

export type CDCL_CHECK_NON_DECISION_MADE_FUN = () => boolean;

export const nonDecisionMade: CDCL_CHECK_NON_DECISION_MADE_FUN = () => {
	return solverNonDecisionMade();
};

export type CDCL_EMPTY_OCCURRENCE_LISTS_FUN = (solverStateMachine: CDCL_SolverMachine) => void;

export const emptyClauseSet: CDCL_EMPTY_OCCURRENCE_LISTS_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	while (solverStateMachine.leftToPostpone() > 0) {
		solverStateMachine.resolvePostponed();
	}
	updateClausesToCheck(new SvelteSet<number>(), -1);
};

// ** additional cdcl function **

export type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (solver: CDCL_SolverMachine) => void;

export const buildConflictAnalysis: CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (
	solver: CDCL_SolverMachine
) => {
	// Firstly the last trail is achieved
	const latestTrail: Trail | undefined = getLatestTrail();
	if (latestTrail === undefined) {
		logFatal('Conflict analysis', 'There is no last trail to work with');
	}

	// Then the variables from the last decision level are retrieved.
	const assignmentsLastDecisionLevel: VariableAssignment[] = latestTrail.getAssignmentsAt(
		latestTrail.getDecisionLevel()
	);
	const variablesLastDecisionLevel: number[] = assignmentsLastDecisionLevel.map((assignment) => {
		return assignment.getVariable().getInt();
	});

	// Thirdly the conflict clause is retrieved
	const ccId: number | undefined = latestTrail.getConflictClauseTag();
	if (ccId === undefined) {
		logFatal(
			'Conflict analysis',
			'It is not possible to do the CA if no conflicts have been found'
		);
	}

	const pool: ClausePool = getClausePool();
	const conflictiveClause: Clause = pool.get(ccId).copy();

	//Lastly, generate the conflict analysis structure
	solver.setConflictAnalysis(latestTrail.partialCopy(), conflictiveClause, variablesLastDecisionLevel);
};

export type CDCL_ASSERTING_CLAUSE_FUN = (solver: CDCL_SolverMachine) => boolean;

export const assertingClause: CDCL_ASSERTING_CLAUSE_FUN = (solver: CDCL_SolverMachine) => {
	return solver.isAssertive();
};

export type CDCL_PICK_LAST_ASSIGNMENT_FUN = (trail: Trail) => VariableAssignment;

export const pickLastAssignment = (trail: Trail) => {
	return trail.pickLastAssignment();
};

export type CDCL_VARIABLE_IN_CC_FUN = (
	conflictClause: Clause,
	assignment: VariableAssignment
) => boolean;

export const variableInCC: CDCL_VARIABLE_IN_CC_FUN = (
	conflictClause: Clause,
	assignment: VariableAssignment
) => {
	return conflictClause.containsVariable(assignment.getVariable().getInt());
};

export type CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	conflictClause: Clause,
	assignment: VariableAssignment
) => Clause;

export const resolutionUpdateCC: CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	conflictClause: Clause,
	assignment: VariableAssignment
) => {
	const reason: Reason = assignment.getReason();
	if (!isPropagationReason(reason)) {
		logFatal('CDCL', 'The reason is not a propagation reason');
	}
	const reasonclauseTag: number = reason.clauseTag;
	const reasonClause: Clause = getClausePool().get(reasonclauseTag);
	const resolvent: Clause = conflictClause.resolution(reasonClause);
	solver.updateConflictClause(resolvent);
	return resolvent;
};

export type CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => void;

export const deleteLastAssignment: CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => {
	const assignment: VariableAssignment = trail.pop() as VariableAssignment;
	getProblemStore().variables.unassign(assignment.getVariable().getInt());
};

export type CDCL_LEARN_CONFLICT_CLAUSE_FUN = (trail: Trail, conflictClause: Clause) => number;

export const learnConflictClause: CDCL_LEARN_CONFLICT_CLAUSE_FUN = (
	trail: Trail,
	conflictClause: Clause
) => {
	//Generate the "Clause" that will be added to the pool.
	const lemma: Clause = new Clause(conflictClause.getLiterals(), { learnt: true });

	//The clause is stored inside the pool
	addClauseToClausePool(lemma);

	// Saves learned clause Id in the trail. IMPORTANT: The clause id IS SET once this is in the clause pool so the learn needs to be done here.
	trail.learnClause(lemma);

	logInfo('New clause learn', `Clause ${lemma.getTag()} learned`);
	return lemma.getTag();
};

export type CDCL_SECOND_HIGHEST_DL_FUN = (trail: Trail, conflictClause: Clause) => number;

export const secondHighestDL: CDCL_SECOND_HIGHEST_DL_FUN = (
	trail: Trail,
	conflictClause: Clause
) => {
	const clauseVariables: number[] = conflictClause.getLiterals().map((literal) => {
		return literal.getVariable().getInt();
	});
	const decisionLevels = clauseVariables
		.map((variable) => trail.getVariableDecisionLevel(variable))
		.filter((level, index, self) => self.indexOf(level) === index)
		.sort((a, b) => b - a);

	return decisionLevels.length >= 2 ? decisionLevels[1] : decisionLevels[0] - 1;
};

export type CDCL_BACKJUMPING_FUN = (trail: Trail, decisionLevel: number) => void;

export const backjumping = (trail: Trail, decisionLevel: number) => {
	trail.backjump(decisionLevel);
};

export type CDCL_PUSH_TRAIL_FUN = (trail: Trail) => void;

export const pushTrail: CDCL_PUSH_TRAIL_FUN = (trail: Trail) => {
	getTrails().push(trail);
};

export type CDCL_PROPAGATE_CC_FUN = (clauseTag: number) => number;

export const propagateCC: CDCL_PROPAGATE_CC_FUN = (clauseTag: number) => {
	const variables: VariablePool = problem.variables;
	const clauses: ClausePool = problem.clauses;
	return solverUnitPropagation(variables, clauses, clauseTag, 'backjumping');
};

export type CDCL_FUN =
	| CDCL_EMPTY_CLAUSE_FUN
	| CDCL_UNIT_CLAUSES_DETECTION_FUN
	| CDCL_PICK_CLAUSE_SET_FUN
	| CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN
	| CDCL_ALL_VARIABLES_ASSIGNED_FUN
	| CDCL_QUEUE_OCCURRENCE_LIST_FUN
	| CDCL_UNSTACK_OCCURRENCE_LIST_FUN
	| CDCL_DELETE_CLAUSE_FUN
	| CDCL_CONFLICT_DETECTION_FUN
	| CDCL_UNIT_CLAUSE_FUN
	| CDCL_UNIT_PROPAGATION_FUN
	| CDCL_COMPLEMENTARY_OCCURRENCES_FUN
	| CDCL_CHECK_NON_DECISION_MADE_FUN
	| CDCL_NEXT_CLAUSE_FUN
	| CDCL_DECIDE_FUN
	| CDCL_EMPTY_OCCURRENCE_LISTS_FUN
	| CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN
	| CDCL_ASSERTING_CLAUSE_FUN
	| CDCL_PICK_LAST_ASSIGNMENT_FUN
	| CDCL_VARIABLE_IN_CC_FUN
	| CDCL_RESOLUTION_UPDATE_CC_FUN
	| CDCL_DELETE_LAST_ASSIGNMENT_FUN
	| CDCL_LEARN_CONFLICT_CLAUSE_FUN
	| CDCL_SECOND_HIGHEST_DL_FUN
	| CDCL_BACKJUMPING_FUN
	| CDCL_PUSH_TRAIL_FUN;
