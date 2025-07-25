import {
	cleanClausesToCheck,
	getCheckedClause,
	incrementCheckingIndex
} from '$lib/states/conflict-detection-state.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { getLatestTrail, updateLastTrailEnding } from '$lib/states/trails.svelte.ts';
import { conflictDetectionEventBus, toggleTrailViewEventBus } from '$lib/events/events.ts';
import { SvelteSet } from 'svelte/reactivity';
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
	CDCL_VARIABLE_IN_CC_FUN,
	CDCL_VARIABLE_IN_CC_INPUT,
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

/* exported transitions */

export const initialTransition = (solver: CDCL_SolverMachine): void => {
	ecTransition(solver.getStateMachine());
	if (solver.onFinalState()) return;
	const complementaryClauses: SvelteSet<number> = ucdTransition(solver.getStateMachine());
	afterComplementaryBlock(solver, solver.getStateMachine(), 0, complementaryClauses);
};

export const preConflictDetection = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const pendingConflict: OccurrenceList = solver.consultPostponed();
	const clauseSet: SvelteSet<number> = pendingConflict.clauses;
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const analyzeClause = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const pendingConflict: OccurrenceList = solver.consultPostponed();
	const clauseSet: SvelteSet<number> = pendingConflict.clauses;
	const clauseTag: number | undefined = getCheckedClause();
	if (clauseTag === undefined) {
		logFatal('Unexpected undefined in inspectedClause');
	}
	deleteClauseTransition(stateMachine, clauseSet, clauseTag);
	conflictDetectionBlock(solver, stateMachine, clauseSet);
};

export const decide = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.getStateMachine();
	const assignedLiteral: number = decideTransition(stateMachine);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	afterComplementaryBlock(solver, stateMachine, assignedLiteral, complementaryClauses);
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
	const conflictAnalysis: ConflictAnalysis | undefined = solver.consultConflictAnalysis();

	if (!conflictAnalysis) {
		logFatal('CDCL solver', 'Conflict data can not be undefined');
	}

	const lastAssignment: VariableAssignment = pickLastAssignmentTransition(
		stateMachine,
		conflictAnalysis
	);

	const variableAppear: boolean = variableInCCTransition(
		stateMachine,
		conflictAnalysis,
		lastAssignment
	);
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
			literal: lastAssignment.toInt()
		});
	} else {
		latestTrail.updateConflictAnalysisCtx();
	}

	deleteLastAssignmentTransition(stateMachine, conflictAnalysis);
	const isAsserting: boolean = assertingClauseTransition(stateMachine, solver);
	if (!isAsserting) {
		setInspectedVariable(conflictAnalysis.trail.pickLastAssignment().getVariable().getInt());
		return;
	}
	const clauseTag: number = learnConflictClauseTransition(stateMachine, conflictAnalysis);
	const secondHighestDL: number = getSecondHighestDLTransition(stateMachine, conflictAnalysis);
	backjumpingTransition(stateMachine, conflictAnalysis, secondHighestDL);
	pushTrailTransition(stateMachine, conflictAnalysis);
	const assignedLiteral = propagateCCTransition(stateMachine, clauseTag);

	(getLatestTrail() as Trail).setFollowUpIndex();

	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	afterComplementaryBlock(solver, stateMachine, assignedLiteral, complementaryClauses);
};

/* General non-exported transitions */

const afterComplementaryBlock = (
	solver: CDCL_SolverMachine,
	stateMachine: CDCL_StateMachine,
	assignedLiteral: number,
	complementaryClauses: SvelteSet<number>
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
	clauseSet: SvelteSet<number>
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
	const clauseTag: number = nextClauseTransition(stateMachine, clauseSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine, clauseTag);
	if (conflict) {
		updateLastTrailEnding(clauseTag);
		toggleTrailViewEventBus.emit();
		return;
	}
	const unitClause: boolean = unitClauseTransition(stateMachine, clauseTag);
	if (!unitClause) return;
	const assignedLiteral: number = unitPropagationTransition(stateMachine, clauseTag);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		assignedLiteral
	);
	queueOccurrenceListTransition(stateMachine, solver, -assignedLiteral, complementaryClauses);
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
		const result: boolean = ecState.run();
		if (result) {
			stateMachine.transition('unsat_state');
		} else {
			stateMachine.transition('unit_clauses_detection_state');
		}
	}
};

const ucdTransition = (stateMachine: CDCL_StateMachine): SvelteSet<number> => {
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
	const result: SvelteSet<number> = ucdState.run();
	stateMachine.transition('queue_occurrence_list_state');
	return result;
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
	literal: number,
	clauseSet: SvelteSet<number>
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
): SvelteSet<number> => {
	const pickClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PICK_CLAUSE_SET_FUN,
		CDCL_PICK_CLAUSE_SET_INPUT
	>;
	if (pickClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	const result: SvelteSet<number> = pickClauseSetState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};

const allClausesCheckedTransition = (
	stateMachine: CDCL_StateMachine,
	clauses: SvelteSet<number>
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

const nextClauseTransition = (
	stateMachine: CDCL_StateMachine,
	clauseSet: SvelteSet<number>
): number => {
	const nextClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_NEXT_CLAUSE_FUN,
		CDCL_NEXT_CLAUSE_INPUT
	>;
	if (nextClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseTag: number = nextClauseState.run(clauseSet);
	stateMachine.transition('conflict_detection_state');
	return clauseTag;
};

const conflictDetectionTransition = (
	stateMachine: CDCL_StateMachine,
	clauseTag: number
): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CONFLICT_DETECTION_FUN,
		CDCL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseTag);
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

const unitClauseTransition = (stateMachine: CDCL_StateMachine, clauseTag: number): boolean => {
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
	const result: boolean = unitClauseState.run(clauseTag);
	if (result) stateMachine.transition('unit_propagation_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const deleteClauseTransition = (
	stateMachine: CDCL_StateMachine,
	clauseSet: SvelteSet<number>,
	clauseTag: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_DELETE_CLAUSE_FUN,
		CDCL_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(clauseSet, clauseTag);
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

const unitPropagationTransition = (stateMachine: CDCL_StateMachine, clauseTag: number): number => {
	const unitPropagationState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNIT_PROPAGATION_FUN,
		CDCL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const literalToPropagate: number = unitPropagationState.run(clauseTag);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const complementaryOccurrencesTransition = (
	stateMachine: CDCL_StateMachine,
	literalToPropagate: number
): SvelteSet<number> => {
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
	const clauses: SvelteSet<number> = complementaryOccurrencesState.run(literalToPropagate);
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
	const literalToPropagate: number = decideState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
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
	stateMachine.transition('variable_in_cc_state');
	return assignment;
};

const variableInCCTransition = (
	stateMachine: CDCL_StateMachine,
	{ conflictClause }: ConflictAnalysis,
	lastAssignment: VariableAssignment
) => {
	const variableInCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_VARIABLE_IN_CC_FUN,
		CDCL_VARIABLE_IN_CC_INPUT
	>;
	if (variableInCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const variableAppears: boolean = variableInCCState.run(conflictClause, lastAssignment);
	if (variableAppears) stateMachine.transition('resolution_update_cc_state');
	else stateMachine.transition('delete_last_assignment_state');
	return variableAppears;
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
	const clauseTag: number = learnConflictClauseState.run(
		conflictAnalysis.trail,
		conflictAnalysis.conflictClause
	);
	stateMachine.transition('second_highest_dl_state');
	return clauseTag;
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

const propagateCCTransition = (stateMachine: CDCL_StateMachine, clauseTag: number): number => {
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
	const literalToPropagate: number = propagateCCState.run(clauseTag);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};
