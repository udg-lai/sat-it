import {
	cleanClausesToCheck,
	getCheckedClause,
	incrementCheckingIndex
} from '$lib/states/conflict-detection-state.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, updateLastTrailEnding } from '$lib/states/trails.svelte.ts';
import { conflictDetectionEventBus, toggleTrailViewEventBus } from '$lib/events/events.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	CDCL_ALL_CLAUSES_CHECKED_FUN,
	CDCL_ALL_CLAUSES_CHECKED_INPUT,
	CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	CDCL_ALL_VARIABLES_ASSIGNED_INPUT,
	CDCL_ASSERTING_CLAUSE_FUN,
	CDCL_ASSERTING_CLAUSE_INPUT,
	CDCL_BACKJUMPING_FUN,
	CDCL_BACKJUMPING_INPUT,
	CDCL_CHECK_NON_DECISION_MADE_FUN,
	CDCL_CHECK_NON_DECISION_MADE_INPUT,
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	CDCL_COMPLEMENTARY_OCCURRENCES_FUN,
	CDCL_COMPLEMENTARY_OCCURRENCES_INPUT,
	CDCL_CONFLICT_DETECTION_FUN,
	CDCL_CONFLICT_DETECTION_INPUT,
	CDCL_DECIDE_FUN,
	CDCL_DECIDE_INPUT,
	CDCL_DELETE_CLAUSE_FUN,
	CDCL_DELETE_CLAUSE_INPUT,
	CDCL_DELETE_LAST_ASSIGNMENT_FUN,
	CDCL_DELETE_LAST_ASSIGNMENT_INPUT,
	CDCL_EMPTY_CLAUSE_FUN,
	CDCL_EMPTY_CLAUSE_INPUT,
	CDCL_EMPTY_OCCURRENCE_LISTS_FUN,
	CDCL_EMPTY_OCCURRENCE_LISTS_INPUT,
	CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	CDCL_LEARN_CONFLICT_CLAUSE_INPUT,
	CDCL_NEXT_CLAUSE_FUN,
	CDCL_NEXT_CLAUSE_INPUT,
	CDCL_PICK_CLAUSE_SET_FUN,
	CDCL_PICK_CLAUSE_SET_INPUT,
	CDCL_PICK_LAST_ASSIGNMENT_FUN,
	CDCL_PICK_LAST_ASSIGNMENT_INPUT,
	CDCL_PROPAGATE_CC_FUN,
	CDCL_PROPAGATE_CC_INPUT,
	CDCL_PUSH_TRAIL_FUN,
	CDCL_PUSH_TRAIL_INPUT,
	CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	CDCL_QUEUE_OCCURRENCE_LIST_INPUT,
	CDCL_RESOLUTION_UPDATE_CC_FUN,
	CDCL_RESOLUTION_UPDATE_CC_INPUT,
	CDCL_SECOND_HIGHEST_DL_FUN,
	CDCL_SECOND_HIGHEST_DL_INPUT,
	CDCL_UNIT_CLAUSE_FUN,
	CDCL_UNIT_CLAUSE_INPUT,
	CDCL_UNIT_CLAUSES_DETECTION_FUN,
	CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	CDCL_UNIT_PROPAGATION_FUN,
	CDCL_UNIT_PROPAGATION_INPUT,
	CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
	CDCL_UNSTACK_OCCURRENCE_LIST_INPUT,
	CDCL_COMPLEMENTARY_IN_CCC_FUN,
	CDCL_COMPLEMENTARY_IN_CCC_INPUT,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
} from './cdcl-domain.svelte.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import type { CDCL_StateMachine } from './cdcl-state-machine.svelte.ts';
import type { ConflictAnalysis, OccurrenceList } from '../types.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type Clause from '$lib/entities/Clause.svelte.ts';
import { setInspectedVariable } from '$lib/states/inspectedVariable.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { isUnitPropagationReason } from '$lib/entities/VariableAssignment.ts';

/* exported transitions */

export const initialTransition = (solver: CDCL_SolverMachine): void => {
	ecTransition(solver.getStateMachine());
	if (solver.onFinalState()) return;
	const complementaryClauses: Set<number> = ucdTransition(solver.getStateMachine());
	afterComplementaryBlock(solver, solver.getStateMachine(), 0, complementaryClauses);
};

export const preConflictDetection = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const pendingConflict: OccurrenceList = solver.consultPostponed();
	const clauseSet: Set<number> = pendingConflict.clauses;
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const analyzeClause = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const pendingConflict: OccurrenceList = solver.consultPostponed();
	const clauseSet: Set<number> = pendingConflict.clauses;
	const cRef: number | undefined = getCheckedClause();
	if (cRef === undefined) {
		logFatal('Unexpected undefined in inspectedClause');
	}
	deleteClauseTransition(stateMachine, clauseSet, cRef);
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const decide = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const assignment: Lit = decideTransition(stateMachine);
	const occurrenceList: Set<CRef> = complementaryOccurrencesTransition(stateMachine, assignment);
	afterComplementaryBlock(solver, stateMachine, assignment, occurrenceList);
};

export const preConflictAnalysis = (solver: CDCL_SolverMachine) => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	emptyOccurrenceListsTransition(stateMachine, solver);
	const onLevelZero: boolean = decisionLevelTransition(stateMachine);
	if (onLevelZero) return;
	buildConflictAnalysisTransition(stateMachine, solver);
	const asserting: boolean = assertingClauseTransition(stateMachine, solver);
	if (asserting) {
		logFatal('It is impossible that the conflictive clause is asserting');
	}
	conflictAnalysis(solver);
};

export const conflictAnalysis = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const conflictAnalysis: ConflictAnalysis = solver.consultConflictAnalysis();

	// Last assignment must be an UP
	const lastAssignment: VariableAssignment = pickLastAssignmentTransition(
		stateMachine,
		conflictAnalysis
	);

	if (!isUnitPropagationReason(lastAssignment.getReason())) {
		logError(
			'CDCL Conflict Analysis',
			'The last assignment in the conflict analysis should be a unit propagation'
		);
	}

	const variableAppear: boolean = complementaryInCCTransition(solver, lastAssignment);
	const latestTrail: Trail | undefined = getLatestTrail();
	if (latestTrail === undefined) logFatal('CDCL solver', 'Latest trail should not be undefined');

	if (variableAppear) {
		const resolvent: Clause = resolutionUpdateCCTransition(
			stateMachine,
			solver,
			conflictAnalysis,
			lastAssignment
		);
		latestTrail.updateConflictAnalysisCtx({
			clause: resolvent,
			literal: lastAssignment.toLit()
		});
	} else {
		latestTrail.updateConflictAnalysisCtx();
	}

	deleteLastAssignmentTransition(stateMachine, conflictAnalysis);
	const isAsserting: boolean = assertingClauseTransition(stateMachine, solver);
	if (!isAsserting) {
		setInspectedVariable(conflictAnalysis.trail.pickLastAssignment().getVariable().toInt());
		return;
	}
	const cRef: CRef = learnConflictClauseTransition(stateMachine, conflictAnalysis);
	const secondHighestDL: number = getSecondHighestDLTransition(stateMachine, conflictAnalysis);
	backjumpingTransition(stateMachine, conflictAnalysis, secondHighestDL);
	pushTrailTransition(stateMachine, conflictAnalysis);
	const propagated: Lit = propagateCCTransition(stateMachine, cRef);

	(getLatestTrail() as Trail).setFollowUpIndex();

	const complementaryClauses: Set<CRef> = complementaryOccurrencesTransition(
		stateMachine,
		propagated
	);
	afterComplementaryBlock(solver, stateMachine, propagated, complementaryClauses);
};

/* General non-exported transitions */

const afterComplementaryBlock = (
	solver: CDCL_SolverMachine,
	stateMachine: CDCL_StateMachine,
	assignedLiteral: number,
	complementaryClauses: Set<number>
): void => {
	queueOccurrenceListTransition(stateMachine, solver, -assignedLiteral, complementaryClauses);
	const pendingClausesSet: boolean = checkPendingOccurrenceListsTransition(stateMachine, solver);
	if (!pendingClausesSet) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	pickClauseSetTransition(stateMachine, solver);
	if (!solver.isInAutoMode()) conflictDetectionEventBus.emit();
};

const conflictDetectionBlock = (
	solver: CDCL_SolverMachine,
	stateMachine: CDCL_StateMachine,
	clauseSet: Set<number>
): void => {
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clauseSet);
	if (allClausesChecked) {
		unstackOccurrenceListTransition(stateMachine, solver);
		const pendingClausesSet: boolean = checkPendingOccurrenceListsTransition(stateMachine, solver);
		if (!pendingClausesSet) {
			cleanClausesToCheck();
			allVariablesAssignedTransition(stateMachine);
			return;
		}
		pickClauseSetTransition(stateMachine, solver);
		return;
	}
	const cRef: number = nextClauseTransition(stateMachine, clauseSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine, cRef);
	if (conflict) {
		updateLastTrailEnding(cRef);
		toggleTrailViewEventBus.emit();
		return;
	}
	const unitClause: boolean = unitClauseTransition(stateMachine, cRef);
	if (!unitClause) return;
	const assignedLit: Lit = unitPropagationTransition(stateMachine, cRef);
	const complementaryClauses: Set<CRef> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLit
	);
	queueOccurrenceListTransition(stateMachine, solver, -assignedLit, complementaryClauses);
};

/* Specific Transitions */

const ecTransition = (stateMachine: CDCL_StateMachine): void => {
	if (stateMachine.getActiveId() !== 0) {
		logFatal(
			'Fail Initial',
			'Trying to use initialTransition in a state that is not the initial one'
		);
	}
	const ecState = stateMachine.getActiveState() as NonFinalState<
		CDCL_EMPTY_CLAUSE_FUN,
		CDCL_EMPTY_CLAUSE_INPUT
	>;
	if (ecState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause state');
	} else {
		const emptyClause: boolean = ecState.run();
		if (emptyClause) {
			stateMachine.transition('unsat_state');
		} else {
			stateMachine.transition('unit_clauses_detection_state');
		}
	}
};

const ucdTransition = (stateMachine: CDCL_StateMachine): Set<CRef> => {
	const ucdState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNIT_CLAUSES_DETECTION_FUN,
		CDCL_UNIT_CLAUSES_DETECTION_INPUT
	>;
	if (ucdState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const units: Set<CRef> = ucdState.run();
	stateMachine.transition('queue_occurrence_list_state');
	return units;
};

const allVariablesAssignedTransition = (stateMachine: CDCL_StateMachine): void => {
	const allVariablesAssignedState = stateMachine.getActiveState() as NonFinalState<
		CDCL_ALL_VARIABLES_ASSIGNED_FUN,
		CDCL_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (allVariablesAssignedState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const result: boolean = allVariablesAssignedState.run();
	if (result) stateMachine.transition('sat_state');
	else stateMachine.transition('decide_state');
};

const queueOccurrenceListTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine,
	literal: Lit,
	clauseSet: Set<CRef>
): void => {
	const queueOccurrenceListState = stateMachine.getActiveState() as NonFinalState<
		CDCL_QUEUE_OCCURRENCE_LIST_FUN,
		CDCL_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (queueOccurrenceListState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Queue Occurrence List state'
		);
	}
	const size: number = queueOccurrenceListState.run(literal, clauseSet, solver);
	if (size > 1) stateMachine.transition('delete_clause_state');
	else stateMachine.transition('check_pending_occurrence_lists_state');
};

const checkPendingOccurrenceListsTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): boolean => {
	const checkPendingOccurrenceListsState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
		CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	>;
	if (checkPendingOccurrenceListsState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Pending Occurrence Lists state'
		);
	}
	const result: boolean = checkPendingOccurrenceListsState.run(solver);
	if (result) stateMachine.transition('pick_clause_set_state');
	else stateMachine.transition('all_variables_assigned_state');
	return result;
};

const pickClauseSetTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): Set<number> => {
	const pickClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PICK_CLAUSE_SET_FUN,
		CDCL_PICK_CLAUSE_SET_INPUT
	>;
	if (pickClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	const result: Set<number> = pickClauseSetState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};

const allClausesCheckedTransition = (
	stateMachine: CDCL_StateMachine,
	clauses: Set<number>
): boolean => {
	const allClausesCheckedState = stateMachine.getActiveState() as NonFinalState<
		CDCL_ALL_CLAUSES_CHECKED_FUN,
		CDCL_ALL_CLAUSES_CHECKED_INPUT
	>;
	if (allClausesCheckedState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the All Clauses Checked state');
	}
	const result: boolean = allClausesCheckedState.run(clauses);
	if (result) stateMachine.transition('unstack_occurrence_list_state');
	else stateMachine.transition('next_clause_state');
	return result;
};

const nextClauseTransition = (stateMachine: CDCL_StateMachine, clauseSet: Set<number>): number => {
	const nextClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_NEXT_CLAUSE_FUN,
		CDCL_NEXT_CLAUSE_INPUT
	>;
	if (nextClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const cRef: number = nextClauseState.run(clauseSet);
	stateMachine.transition('conflict_detection_state');
	return cRef;
};

const conflictDetectionTransition = (stateMachine: CDCL_StateMachine, cRef: number): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CONFLICT_DETECTION_FUN,
		CDCL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(cRef);
	if (result) stateMachine.transition('empty_occurrence_lists_state');
	else stateMachine.transition('unit_clause_state');
	return result;
};

const decisionLevelTransition = (stateMachine: CDCL_StateMachine): boolean => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CHECK_NON_DECISION_MADE_FUN,
		CDCL_CHECK_NON_DECISION_MADE_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const onLevelZero: boolean = decisionLevelState.run();
	if (onLevelZero) stateMachine.transition('unsat_state');
	else stateMachine.transition('build_conflict_analysis_state');
	return onLevelZero;
};

const unitClauseTransition = (stateMachine: CDCL_StateMachine, cRef: number): boolean => {
	const unitClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNIT_CLAUSE_FUN,
		CDCL_UNIT_CLAUSE_INPUT
	>;
	if (unitClauseState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const result: boolean = unitClauseState.run(cRef);
	if (result) stateMachine.transition('unit_propagation_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const deleteClauseTransition = (
	stateMachine: CDCL_StateMachine,
	clauseSet: Set<number>,
	cRef: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_DELETE_CLAUSE_FUN,
		CDCL_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(clauseSet, cRef);
	stateMachine.transition('all_clauses_checked_state');
	incrementCheckingIndex();
};

const unstackOccurrenceListTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): void => {
	const unstackOccurrenceListState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNSTACK_OCCURRENCE_LIST_FUN,
		CDCL_UNSTACK_OCCURRENCE_LIST_INPUT
	>;
	if (unstackOccurrenceListState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unstack Occurrence List state'
		);
	}
	unstackOccurrenceListState.run(solver);
	stateMachine.transition('check_pending_occurrence_lists_state');
};

const unitPropagationTransition = (stateMachine: CDCL_StateMachine, cRef: CRef): Lit => {
	const unitPropagationState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNIT_PROPAGATION_FUN,
		CDCL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const propagated: Lit = unitPropagationState.run(cRef);
	stateMachine.transition('complementary_occurrences_state');
	return propagated;
};

const complementaryOccurrencesTransition = (
	stateMachine: CDCL_StateMachine,
	assignment: Lit
): Set<CRef> => {
	const complementaryOccurrencesState = stateMachine.getActiveState() as NonFinalState<
		CDCL_COMPLEMENTARY_OCCURRENCES_FUN,
		CDCL_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (complementaryOccurrencesState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: Set<CRef> = complementaryOccurrencesState.run(assignment);
	stateMachine.transition('queue_occurrence_list_state');
	return clauses;
};

const decideTransition = (stateMachine: CDCL_StateMachine): number => {
	const decideState = stateMachine.getActiveState() as NonFinalState<
		CDCL_DECIDE_FUN,
		CDCL_DECIDE_INPUT
	>;
	if (decideState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const decision: Lit = decideState.run();
	stateMachine.transition('complementary_occurrences_state');
	return decision;
};

const emptyOccurrenceListsTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_EMPTY_OCCURRENCE_LISTS_FUN,
		CDCL_EMPTY_OCCURRENCE_LISTS_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Empty Occurrence Lists state'
		);
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};

// ** cdcl transition **

const buildConflictAnalysisTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
) => {
	const buildConflictAnalysisState = stateMachine.getActiveState() as NonFinalState<
		CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
		CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	>;
	if (buildConflictAnalysisState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Build Conflict Analysis state'
		);
	}
	buildConflictAnalysisState.run(solver);
	stateMachine.transition('asserting_clause_state');
};

const assertingClauseTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): boolean => {
	const assertingClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_ASSERTING_CLAUSE_FUN,
		CDCL_ASSERTING_CLAUSE_INPUT
	>;
	if (assertingClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Asserting Clause state');
	}
	const isAsserting: boolean = assertingClauseState.run(solver);
	if (isAsserting) stateMachine.transition('learn_cc_state');
	else stateMachine.transition('pick_last_assignment_state');
	return isAsserting;
};

const pickLastAssignmentTransition = (
	stateMachine: CDCL_StateMachine,
	{ trail }: ConflictAnalysis
) => {
	const pickLastAssignmentState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PICK_LAST_ASSIGNMENT_FUN,
		CDCL_PICK_LAST_ASSIGNMENT_INPUT
	>;
	if (pickLastAssignmentState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pick Last Assignment state');
	}
	const assignment: VariableAssignment = pickLastAssignmentState.run(trail);
	stateMachine.transition('complementary_in_ccc_state_state');
	return assignment;
};

const complementaryInCCTransition = (
	cdclSolver: CDCL_SolverMachine,
	lastAssignment: VariableAssignment
) => {
	const complementaryInCCState = cdclSolver.getActiveState() as NonFinalState<
		CDCL_COMPLEMENTARY_IN_CCC_FUN,
		CDCL_COMPLEMENTARY_IN_CCC_INPUT
	>;
	if (complementaryInCCState.run === undefined) {
		logFatal('Complementary In CC', 'No function defined in the Complementary In CC state');
	}

	const { conflictClause } = cdclSolver.consultConflictAnalysis();

	const complementaryExists: boolean = complementaryInCCState.run(conflictClause, lastAssignment);
	if (complementaryExists) cdclSolver.transition('resolution_update_cc_state');
	else cdclSolver.transition('delete_last_assignment_state');
	return complementaryExists;
};

const resolutionUpdateCCTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine,
	{ conflictClause }: ConflictAnalysis,
	lastAssignment: VariableAssignment
): Clause => {
	const resolutionUpdateCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_RESOLUTION_UPDATE_CC_FUN,
		CDCL_RESOLUTION_UPDATE_CC_INPUT
	>;
	if (resolutionUpdateCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const resolvent: Clause = resolutionUpdateCCState.run(solver, conflictClause, lastAssignment);
	stateMachine.transition('delete_last_assignment_state');
	return resolvent;
};

const deleteLastAssignmentTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis
) => {
	const deleteLastAssignmentState = stateMachine.getActiveState() as NonFinalState<
		CDCL_DELETE_LAST_ASSIGNMENT_FUN,
		CDCL_DELETE_LAST_ASSIGNMENT_INPUT
	>;
	if (deleteLastAssignmentState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	deleteLastAssignmentState.run(conflictAnalysis.trail);
	stateMachine.transition('asserting_clause_state');
};

const learnConflictClauseTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis
): number => {
	const learnConflictClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_LEARN_CONFLICT_CLAUSE_FUN,
		CDCL_LEARN_CONFLICT_CLAUSE_INPUT
	>;
	if (learnConflictClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const cRef: number = learnConflictClauseState.run(
		conflictAnalysis.trail,
		conflictAnalysis.conflictClause
	);
	stateMachine.transition('second_highest_dl_state');
	return cRef;
};

const getSecondHighestDLTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis
) => {
	const getSecondHighestDLState = stateMachine.getActiveState() as NonFinalState<
		CDCL_SECOND_HIGHEST_DL_FUN,
		CDCL_SECOND_HIGHEST_DL_INPUT
	>;
	if (getSecondHighestDLState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const secondHighestDL: number = getSecondHighestDLState.run(
		conflictAnalysis.trail,
		conflictAnalysis.conflictClause
	);
	stateMachine.transition('undo_backjumping_state');
	return secondHighestDL;
};

const backjumpingTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis,
	secondHighestDL: number
) => {
	const backjumpingState = stateMachine.getActiveState() as NonFinalState<
		CDCL_BACKJUMPING_FUN,
		CDCL_BACKJUMPING_INPUT
	>;
	if (backjumpingState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	backjumpingState.run(conflictAnalysis.trail, secondHighestDL);
	increaseNoConflicts();
	stateMachine.transition('push_trail_state');
};

const pushTrailTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis
) => {
	const pushTrailState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PUSH_TRAIL_FUN,
		CDCL_PUSH_TRAIL_INPUT
	>;
	if (pushTrailState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	pushTrailState.run(conflictAnalysis.trail);
	stateMachine.transition('propagate_cc_state');
};

const propagateCCTransition = (stateMachine: CDCL_StateMachine, cRef: number): number => {
	const propagateCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PROPAGATE_CC_FUN,
		CDCL_PROPAGATE_CC_INPUT
	>;
	if (propagateCCState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Propagate Conflict Clause state'
		);
	}
	const decision: Lit = propagateCCState.run(cRef);
	stateMachine.transition('complementary_occurrences_state');
	return decision;
};
