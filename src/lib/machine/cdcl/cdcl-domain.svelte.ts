import {
	addClauseToClausePool,
	getProblemStore,
	type MappingLiteral2Clauses,
	type Problem
} from '$lib/store/problem.svelte.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import {
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	emptyClauseDetection as solverEmptyClauseDetection,
	triggeredClauses as solverTriggeredClauses,
	unitClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation,
	complementaryOccurrences as solverComplementaryOccurrences,
	nonDecisionMade as solverNonDecisionMade,
	decide as solverDecide
} from '$lib/transversal/algorithms/solver.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import type { ConflictDetection } from '../SolverMachine.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import Clause, {
	isUnitClause,
	isUnSATClause,
	type ClauseEval
} from '$lib/transversal/entities/Clause.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { getLatestTrail, getTrails } from '$lib/store/trails.svelte.ts';
import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import {
	isUnitPropagationReason,
	type Reason
} from '$lib/transversal/entities/VariableAssignment.ts';
import TemporalClause from '$lib/transversal/entities/TemporalClause.ts';

const problem: Problem = $derived(getProblemStore());

// ** state inputs **

export type CDCL_EMPTY_CLAUSE_INPUT = 'unit_clauses_detection_state' | 'unsat_state';

export type CDCL_TRIGGERED_CLAUSES_INPUT =
	| 'queue_clause_set_state'
	| 'all_variables_assigned_state'
	| 'delete_clause_state';

export type CDCL_UNIT_CLAUSES_DETECTION_INPUT = 'triggered_clauses_state';

export type CDCL_PICK_CLAUSE_SET_INPUT = 'all_clauses_checked_state';

export type CDCL_CHECK_PENDING_CLAUSES_INPUT =
	| 'all_variables_assigned_state'
	| 'pick_clause_set_state';

export type CDCL_QUEUE_CLAUSE_SET_INPUT = 'check_pending_clauses_state' | 'delete_clause_state';

export type CDCL_UNSTACK_CLAUSE_SET_INPUT = 'check_pending_clauses_state';

export type CDCL_DELETE_CLAUSE_INPUT = 'all_clauses_checked_state';

export type CDCL_ALL_CLAUSES_CHECKED_INPUT = 'next_clause_state' | 'unstack_clause_set_state';

export type CDCL_NEXT_CLAUSE_INPUT = 'conflict_detection_state';

export type CDCL_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'empty_clause_set_state';

export type CDCL_UNIT_CLAUSE_INPUT = 'delete_clause_state' | 'unit_propagation_state';

export type CDCL_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type CDCL_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type CDCL_COMPLEMENTARY_OCCURRENCES_INPUT = 'triggered_clauses_state';

export type CDCL_CHECK_NON_DECISION_MADE_INPUT = 'build_conflict_analysis_state' | 'unsat_state';

export type CDCL_DECIDE_INPUT = 'complementary_occurrences_state';

export type CDCL_EMPTY_CLAUSE_SET_INPUT = 'decision_level_state';

//New CDCL Inputs

export type CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT = 'asserting_clause_state';

export type CDCL_ASSERTING_CLAUSE_INPUT = 'learn_cc_state' | 'pick_last_assignment_state';

export type CDCL_PICK_LAST_ASSIGNMENT_INPUT = 'variable_in_cc_state';

export type CDCL_VARIABLE_IN_CC_INPUT =
	| 'resolution_update_cc_state'
	| 'delete_last_assignment_state';

export type CDCL_RESOLUTION_UPDATE_CC_INPUT = 'delete_last_assignment_state';

export type CDCL_DELETE_LAST_ASSIGNMENT_INPUT = 'asserting_clause_state';

export type CDCL_LEARN_CONCLICT_CLAUSE_INPUT = 'second_highest_dl_state';

export type CDCL_SECOND_HIGHEST_DL_INPUT = 'undo_backjumping_state';

export type CDCL_BACKJUMPING_INPUT = 'push_trail_state';

export type CDCL_PUSH_TRAIL_INPUT = 'unit_propagation_state';

export type CDCL_INPUT =
	| CDCL_EMPTY_CLAUSE_INPUT
	| CDCL_UNIT_CLAUSES_DETECTION_INPUT
	| CDCL_PICK_CLAUSE_SET_INPUT
	| CDCL_ALL_VARIABLES_ASSIGNED_INPUT
	| CDCL_TRIGGERED_CLAUSES_INPUT
	| CDCL_QUEUE_CLAUSE_SET_INPUT
	| CDCL_UNSTACK_CLAUSE_SET_INPUT
	| CDCL_ALL_CLAUSES_CHECKED_INPUT
	| CDCL_NEXT_CLAUSE_INPUT
	| CDCL_CONFLICT_DETECTION_INPUT
	| CDCL_CHECK_PENDING_CLAUSES_INPUT
	| CDCL_DELETE_CLAUSE_INPUT
	| CDCL_UNIT_CLAUSE_INPUT
	| CDCL_UNIT_PROPAGATION_INPUT
	| CDCL_COMPLEMENTARY_OCCURRENCES_INPUT
	| CDCL_CHECK_NON_DECISION_MADE_INPUT
	| CDCL_DECIDE_INPUT
	| CDCL_EMPTY_CLAUSE_SET_INPUT
	| CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	| CDCL_ASSERTING_CLAUSE_INPUT
	| CDCL_PICK_LAST_ASSIGNMENT_INPUT
	| CDCL_VARIABLE_IN_CC_INPUT
	| CDCL_RESOLUTION_UPDATE_CC_INPUT
	| CDCL_DELETE_LAST_ASSIGNMENT_INPUT
	| CDCL_LEARN_CONCLICT_CLAUSE_INPUT
	| CDCL_SECOND_HIGHEST_DL_INPUT
	| CDCL_BACKJUMPING_INPUT
	| CDCL_PUSH_TRAIL_INPUT;

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

export type CDCL_QUEUE_CLAUSE_SET_FUN = (
	variable: number,
	clauses: Set<number>,
	solverStateMachine: CDCL_SolverMachine
) => number;

//HERE I NEED TO CHECK IF I REALLY USE THE REUTRN VALUE FOR SOMETHING

export const queueClauseSet: CDCL_QUEUE_CLAUSE_SET_FUN = (
	variable: number,
	clauses: Set<number>,
	solverStateMachine: CDCL_SolverMachine
) => {
	if (clauses.size === 0) {
		logFatal('Empty set of clauses are not thought to be queued');
	}
	const conflict: ConflictDetection = { clauses: clauses, variableReasonId: variable };
	solverStateMachine.postpone(conflict);
	return solverStateMachine.leftToPostpone();
};

export type CDCL_UNSTACK_CLAUSE_SET_FUN = (solverStateMachine: CDCL_SolverMachine) => void;

export const unstackClauseSet: CDCL_UNSTACK_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	return solverStateMachine.resolvePostponed();
};

export type CDCL_UNIT_CLAUSES_DETECTION_FUN = () => Set<number>;

export const unitClauseDetection: CDCL_UNIT_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = problem.clauses;
	return solverUnitClauseDetection(pool);
};

export type CDCL_TRIGGERED_CLAUSES_FUN = (clauses: Set<number>) => boolean;

export const triggeredClauses: CDCL_TRIGGERED_CLAUSES_FUN = (clauses: Set<number>) => {
	return solverTriggeredClauses(clauses);
};

export type CDCL_DELETE_CLAUSE_FUN = (clauses: Set<number>, clauseId: number) => void;

export const deleteClause: CDCL_DELETE_CLAUSE_FUN = (clauses: Set<number>, clauseId: number) => {
	if (!clauses.has(clauseId)) {
		logFatal('Clause not found', `Clause - ${clauseId} not found`);
	}
	clauses.delete(clauseId);
};

export type CDCL_PICK_CLAUSE_SET_FUN = (solverStateMachine: CDCL_SolverMachine) => Set<number>;

export const pickPendingClauseSet: CDCL_PICK_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	const pendingConflict: ConflictDetection = solverStateMachine.consultPostponed();
	updateClausesToCheck(pendingConflict.clauses, pendingConflict.variableReasonId);
	return pendingConflict.clauses;
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
	const clauseId = clausesIterator.value;
	return clauseId as number;
};

export type CDCL_CONFLICT_DETECTION_FUN = (clauseId: number) => boolean;

export const unsatisfiedClause: CDCL_CONFLICT_DETECTION_FUN = (clauseId: number) => {
	const pool: ClausePool = problem.clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseId);
	return isUnSATClause(evaluation);
};

export type CDCL_CHECK_PENDING_CLAUSES_FUN = (solverStateMachine: CDCL_SolverMachine) => boolean;

export const thereAreJobPostponed: CDCL_CHECK_PENDING_CLAUSES_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	return solverStateMachine.thereArePostponed();
};

export type CDCL_UNIT_CLAUSE_FUN = (clauseId: number) => boolean;

export const unitClause: CDCL_UNIT_CLAUSE_FUN = (clauseId: number) => {
	const pool: ClausePool = problem.clauses;
	const evaluation: ClauseEval = clauseEvaluation(pool, clauseId);
	return isUnitClause(evaluation);
};

export type CDCL_UNIT_PROPAGATION_FUN = (clauseId: number) => number;

export const unitPropagation: CDCL_UNIT_PROPAGATION_FUN = (clauseId: number) => {
	const variables: VariablePool = problem.variables;
	const clauses: ClausePool = problem.clauses;
	return solverUnitPropagation(variables, clauses, clauseId);
};

export type CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => Set<number>;

export const complementaryOccurrences: CDCL_COMPLEMENTARY_OCCURRENCES_FUN = (literal: number) => {
	const mapping: MappingLiteral2Clauses = problem.mapping;
	return solverComplementaryOccurrences(mapping, literal);
};

export type CDCL_CHECK_NON_DECISION_MADE_FUN = () => boolean;

export const nonDecisionMade: CDCL_CHECK_NON_DECISION_MADE_FUN = () => {
	return solverNonDecisionMade();
};

export type CDCL_EMPTY_CLAUSE_SET_FUN = (solverStateMachine: CDCL_SolverMachine) => void;

export const emptyClauseSet: CDCL_EMPTY_CLAUSE_SET_FUN = (
	solverStateMachine: CDCL_SolverMachine
) => {
	while (solverStateMachine.leftToPostpone() > 0) {
		solverStateMachine.resolvePostponed();
	}
	updateClausesToCheck(new Set<number>(), -1);
};

// ** additional cdcl function **

export type CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (solver: CDCL_SolverMachine) => void;

export const buildConflictAnalysis: CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = (
	solver: CDCL_SolverMachine
) => {
	// Firstly the last trail is achieved
	const latestTrail: Trail | undefined = getLatestTrail();
	if (latestTrail === undefined) {
		logFatal('Not possible result', 'There is no last trail to work with');
	}

	// Then the variables from the last decision level are retrieved.
	const assignmentsLastDecisionLevel: VariableAssignment[] = latestTrail.getLevelAssignments(
		latestTrail.getDecisionLevel()
	);
	const variablesLastDecisionLevel: number[] = assignmentsLastDecisionLevel.map((assignment) => {
		return assignment.getVariable().getInt();
	});

	// Thirdly the conclict clause is retrieved
	const conflictiveClauseId: number | undefined = latestTrail.getTrailConflict();
	if (conflictiveClauseId === undefined) {
		logFatal(
			'Not possible result',
			'It is not possible to do the CA if no conflicts have been found'
		);
	}
	const conflictiveClause: Clause = getProblemStore().clauses.get(conflictiveClauseId);
	const conflictiveClauseCopy: TemporalClause = new TemporalClause(
		conflictiveClause.getLiterals()
	);
	//Lastly, generate the conflict analysis structure
	solver.setConflictAnalysis(
		latestTrail.partialCopy(),
		conflictiveClauseCopy,
		variablesLastDecisionLevel
	);
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
	conclictClause: TemporalClause,
	assignment: VariableAssignment
) => boolean;

export const variableInCC: CDCL_VARIABLE_IN_CC_FUN = (
	conclictClause: TemporalClause,
	assignment: VariableAssignment
) => {
	return conclictClause.containsVariable(assignment.getVariable().getInt());
};

export type CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	conflictClause: TemporalClause,
	assignment: VariableAssignment
) => void;

export const resolutionUpdateCC: CDCL_RESOLUTION_UPDATE_CC_FUN = (
	solver: CDCL_SolverMachine,
	conflictClause: TemporalClause,
	assignment: VariableAssignment
) => {
	const reason: Reason = assignment.getReason();
	if (!isUnitPropagationReason(reason)) {
		logFatal('The Reason should be a UP');
	}
	const upClauseId: number = reason.clauseId;
	const upClause: Clause = getProblemStore().clauses.get(upClauseId);
	const newCC: TemporalClause = conflictClause.resolution(upClause.toTemporalClause());
	solver.updateConflictClause(newCC);
};

export type CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => void;

export const deleteLastAssignment: CDCL_DELETE_LAST_ASSIGNMENT_FUN = (trail: Trail) => {
	const assignment: VariableAssignment = trail.pop() as VariableAssignment;
	getProblemStore().variables.dispose(assignment.getVariable().getInt());
};

export type CDCL_LEARN_CONCLICT_CLAUSE_FUN = (
	trail: Trail,
	conclictClause: TemporalClause
) => number;

export const learnConflictClause: CDCL_LEARN_CONCLICT_CLAUSE_FUN = (
	trail: Trail,
	conclictClause: TemporalClause
) => {
	//Add the UnindexedClause to the trail
	trail.learn(conclictClause);

	//Generate the "Clause" that will be added to the pool.
	const toLearnClause: Clause = new Clause(conclictClause.getLiterals());

	//The clause is stored inside the pool
	addClauseToClausePool(toLearnClause);
	return toLearnClause.getId();
};

export type CDCL_SECOND_HIGHEST_DL_FUN = (trail: Trail, conclictClause: TemporalClause) => number;

export const secondHighestDL: CDCL_SECOND_HIGHEST_DL_FUN = (
	trail: Trail,
	conclictClause: TemporalClause
) => {
	const clauseVariables: number[] = conclictClause.getLiterals().map((literal) => {
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

export type CDCL_FUN =
	| CDCL_EMPTY_CLAUSE_FUN
	| CDCL_UNIT_CLAUSES_DETECTION_FUN
	| CDCL_PICK_CLAUSE_SET_FUN
	| CDCL_CHECK_PENDING_CLAUSES_FUN
	| CDCL_ALL_VARIABLES_ASSIGNED_FUN
	| CDCL_QUEUE_CLAUSE_SET_FUN
	| CDCL_UNSTACK_CLAUSE_SET_FUN
	| CDCL_DELETE_CLAUSE_FUN
	| CDCL_CONFLICT_DETECTION_FUN
	| CDCL_UNIT_CLAUSE_FUN
	| CDCL_UNIT_PROPAGATION_FUN
	| CDCL_COMPLEMENTARY_OCCURRENCES_FUN
	| CDCL_CHECK_NON_DECISION_MADE_FUN
	| CDCL_DECIDE_FUN
	| CDCL_EMPTY_CLAUSE_SET_FUN
	| CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN
	| CDCL_ASSERTING_CLAUSE_FUN
	| CDCL_PICK_LAST_ASSIGNMENT_FUN
	| CDCL_VARIABLE_IN_CC_FUN
	| CDCL_RESOLUTION_UPDATE_CC_FUN
	| CDCL_DELETE_LAST_ASSIGNMENT_FUN
	| CDCL_LEARN_CONCLICT_CLAUSE_FUN
	| CDCL_SECOND_HIGHEST_DL_FUN
	| CDCL_BACKJUMPING_FUN
	| CDCL_PUSH_TRAIL_FUN;
