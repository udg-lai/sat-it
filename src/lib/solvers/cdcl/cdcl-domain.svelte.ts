import Clause, {
	isUnitClause,
	isUnSATClause,
	type ClauseEval
} from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import { isPropagationReason, type Reason } from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
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
import {
	cleanClausesToCheck,
	updateClausesToCheck
} from '$lib/states/conflict-detection-state.svelte.ts';
import { resetInspectedVariable } from '$lib/states/inspectedVariable.svelte.ts';
import {
	getClausePool,
	getOccurrencesTableMapping,
	getProblemStore,
	getVariablePool
} from '$lib/states/problem.svelte.ts';
import { logFatal, logInfo } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, stackTrail } from '$lib/states/trails.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type { OccurrenceList } from '../types.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';

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

export type CDCL_PICK_LAST_ASSIGNMENT_INPUT = 'complementary_in_ccc_state_state';

export type CDCL_COMPLEMENTARY_IN_CCC_INPUT =
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
	| CDCL_COMPLEMENTARY_IN_CCC_INPUT
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
	const pool: VariablePool = getVariablePool();
	const decision: Lit = solverDecide(pool, 'cdcl');
	return decision;
};

export type CDCL_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: CDCL_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type CDCL_EMPTY_CLAUSE_FUN = () => boolean;

export const emptyClauseDetection: CDCL_EMPTY_CLAUSE_FUN = () => {
	const hasConflict: boolean = solverEmptyClauseDetection(getClausePool());
	return hasConflict;
};

export type CDCL_QUEUE_OCCURRENCE_LIST_FUN = (
	literal: Lit,
	clauses: Set<CRef>,
	solverStateMachine: CDCL_SolverMachine
) => number;

export const queueClauseSet: CDCL_QUEUE_OCCURRENCE_LIST_FUN = (
	literal: Lit,
	clauses: Set<CRef>,
	solverStateMachine: CDCL_SolverMachine
) => {
	const occurrenceList: OccurrenceList = { clauses, literal };
	solverStateMachine.postpone(occurrenceList);
	return solverStateMachine.leftToPostpone();
};

export type CDCL_UNSTACK_OCCURRENCE_LIST_FUN = (solverStateMachine: CDCL_SolverMachine) => void;

export const unstackClauseSet: CDCL_UNSTACK_OCCURRENCE_LIST_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	return solverStateMachine.resolvePostponed();
};

export type CDCL_UNIT_CLAUSES_DETECTION_FUN = () => Set<number>;

export const unitClauseDetection: CDCL_UNIT_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverUnitClauseDetection(pool);
};

export type CDCL_DELETE_CLAUSE_FUN = (clauses: Set<number>, cRef: number) => void;

export const deleteClause: CDCL_DELETE_CLAUSE_FUN = (clauses: Set<number>, cRef: number) => {
	if (!clauses.has(cRef)) {
		logFatal('Clause not found', `Clause - ${cRef} not found`);
	}
	clauses.delete(cRef);
};

export type CDCL_PICK_CLAUSE_SET_FUN = (solverStateMachine: CDCL_SolverMachine) => Set<number>;

export const pickPendingClauseSet: CDCL_PICK_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	const { clauses, literal }: OccurrenceList = solverStateMachine.consultPostponed();
	updateClausesToCheck(clauses, literal);
	return clauses;
};

export type CDCL_ALL_CLAUSES_CHECKED_FUN = (clauses: Set<number>) => boolean;

export const allClausesChecked: CDCL_ALL_CLAUSES_CHECKED_FUN = (clauses: Set<number>) => {
	return clauses.size === 0;
};

export type CDCL_NEXT_CLAUSE_FUN = (clauses: Set<number>) => number;

export const nextClause: CDCL_NEXT_CLAUSE_FUN = (clauses: Set<number>) => {
	if (clauses.size === 0) {
		logFatal('A non empty set was expected');
	}
	const clausesIterator = clauses.values().next();
	const cRef = clausesIterator.value;
	return cRef as number;
};

export type CDCL_CONFLICT_DETECTION_FUN = (cRef: number) => boolean;

export const unsatisfiedClause: CDCL_CONFLICT_DETECTION_FUN = (cRef: number) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, cRef);
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

export type CDCL_UNIT_CLAUSE_FUN = (cRef: number) => boolean;

export const unitClause: CDCL_UNIT_CLAUSE_FUN = (cRef: number) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, cRef);
	return isUnitClause(evaluation);
};

export type CDCL_UNIT_PROPAGATION_FUN = (cRef: CRef) => number;

export const unitPropagation: CDCL_UNIT_PROPAGATION_FUN = (cRef: CRef) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, cRef, 'up');
};

export type CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => {
	const mapping: Map<Lit, Set<CRef>> = getOccurrencesTableMapping();
	return solverComplementaryOccurrences(mapping, assignment);
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
	cleanClausesToCheck();
};

// ** additional cdcl function **

export type CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (solver: CDCL_SolverMachine) => void;

export const buildConflictAnalysis: CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (
	solver: CDCL_SolverMachine
) => {
	// Firstly the last trail is achieved
	const assignment: Trail | undefined = getLatestTrail();
	if (assignment === undefined) {
		logFatal('Conflict analysis', 'There is no last trail to work with');
	} else if (assignment.isEmpty()) {
		logFatal('Conflict analysis', 'The last trail is empty');
	} else {
		assignment.setState('conflict');
	}

	// Then the variables from the last decision level are retrieved.
	const ldlAssignments: VariableAssignment[] = assignment.getAssignmentsAtLevel(
		assignment.getDecisionLevel()
	);
	const ldlLiterals: Lit[] = ldlAssignments.map((assignment) => assignment.toLit());

	// Thirdly the conflict clause is retrieved
	const cRef: CRef | undefined = assignment.getConflictiveClause()?.getCRef();
	if (cRef === undefined) {
		logFatal(
			'Conflict analysis',
			'It is not possible to do the CA if no conflicts have been found'
		);
	}

	const pool: ClausePool = getClausePool();
	const conflictiveClause: Clause = pool.at(cRef).copy();

	// Lastly, generate the conflict analysis structure
	const assignmentCopy: Trail = assignment.copy();
	assignmentCopy.cleanConflict();
	solver.setConflictAnalysis(assignmentCopy, conflictiveClause, ldlLiterals);
};

export type CDCL_ASSERTING_CLAUSE_FUN = (solver: CDCL_SolverMachine) => boolean;

export const assertingClause: CDCL_ASSERTING_CLAUSE_FUN = (solver: CDCL_SolverMachine) => {
	const { conflictClause, ldlAssignments } = solver.getConflictAnalysis();
	return conflictClause.isAssertive(ldlAssignments);
};

export type CDCL_PICK_LAST_ASSIGNMENT_FUN = (trail: Trail) => VariableAssignment;

export const pickLastAssignment: CDCL_PICK_LAST_ASSIGNMENT_FUN = (trail: Trail) => {
	const lastAssignment: VariableAssignment = trail.pickLastAssignment();
	return lastAssignment;
};

export type CDCL_COMPLEMENTARY_IN_CCC_FUN = (
	conflictClause: Clause,
	assignment: VariableAssignment
) => boolean;

export const complementaryOccursInCCC: CDCL_COMPLEMENTARY_IN_CCC_FUN = (
	ccc: Clause,
	assignment: VariableAssignment
) => {
	const complementary: Lit = Literal.complementary(assignment.toLit());
	return ccc.containsLiteral(complementary);
};

export type CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	conflictClause: Clause,
	assignment: VariableAssignment
) => Clause;

export const resolutionUpdateCC: CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	cc: Clause,
	assignment: VariableAssignment
) => {
	const reason: Reason = assignment.getReason();
	if (!isPropagationReason(reason)) {
		logFatal('resolutionUpdateCC', 'The reason is not a propagation reason');
	}
	const reasonClause: Clause = getClausePool().at(reason.cRef);
	const resolvent: Clause = cc.resolution(reasonClause);
	solver.updateConflictClause(resolvent);
	return resolvent;
};

export type CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => void;

export const deleteLastAssignment: CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => {
	const assignment: VariableAssignment = trail.pop();
	const pool: VariablePool = getVariablePool();
	pool.unassign(assignment.toVar());
};

export type CDCL_LEARN_CONFLICT_CLAUSE_FUN = (trail: Trail, conflictClause: Clause) => number;

export const learnConflictClause: CDCL_LEARN_CONFLICT_CLAUSE_FUN = (
	trail: Trail,
	lemma: Clause
) => {
	//Set the lemma as learnt. This will be the clause that will be added to the pool.
	lemma.setAsLemma();

	//The lemma is stored inside the pool
	const cRef: CRef = getProblemStore().addClause(lemma);

	// Saves the learnt clause in the trail
	trail.attachLemma(lemma);

	logInfo('New clause learned', `Clause ${cRef} added to the clause pool`);

	resetInspectedVariable();

	return cRef;
};

export type CDCL_SECOND_HIGHEST_DL_FUN = (trail: Trail, conflictClause: Clause) => number;

export const secondHighestDL: CDCL_SECOND_HIGHEST_DL_FUN = (
	trail: Trail,
	conflictClause: Clause
) => {
	const clauseVariables: number[] = conflictClause.getLiterals().map((literal) => {
		return literal.getVariable().toInt();
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
	stackTrail(trail);
};

export type CDCL_PROPAGATE_CC_FUN = (cRef: CRef) => Lit;

export const propagateCC: CDCL_PROPAGATE_CC_FUN = (cRef: CRef) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, cRef, 'backjumping');
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
	| CDCL_COMPLEMENTARY_IN_CCC_FUN
	| CDCL_RESOLUTION_UPDATE_CC_FUN
	| CDCL_DELETE_LAST_ASSIGNMENT_FUN
	| CDCL_LEARN_CONFLICT_CLAUSE_FUN
	| CDCL_SECOND_HIGHEST_DL_FUN
	| CDCL_BACKJUMPING_FUN
	| CDCL_PUSH_TRAIL_FUN;
