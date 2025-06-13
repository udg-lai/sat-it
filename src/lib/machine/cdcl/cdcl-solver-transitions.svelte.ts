import { logFatal } from '$lib/store/toasts.ts';
import { updateLastTrailEnding } from '$lib/store/trails.svelte.ts';
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
	CDCL_CHECK_PENDING_CLAUSES_FUN,
	CDCL_CHECK_PENDING_CLAUSES_INPUT,
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
	CDCL_EMPTY_CLAUSE_SET_FUN,
	CDCL_EMPTY_CLAUSE_SET_INPUT,
	CDCL_LEARN_CONCLICT_CLAUSE_FUN,
	CDCL_LEARN_CONCLICT_CLAUSE_INPUT,
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
	CDCL_QUEUE_CLAUSE_SET_FUN,
	CDCL_QUEUE_CLAUSE_SET_INPUT,
	CDCL_RESOLUTION_UPDATE_CC_FUN,
	CDCL_RESOLUTION_UPDATE_CC_INPUT,
	CDCL_SECOND_HIGHEST_DL_FUN,
	CDCL_SECOND_HIGHEST_DL_INPUT,
	CDCL_TRIGGERED_CLAUSES_FUN,
	CDCL_TRIGGERED_CLAUSES_INPUT,
	CDCL_UNIT_CLAUSE_FUN,
	CDCL_UNIT_CLAUSE_INPUT,
	CDCL_UNIT_CLAUSES_DETECTION_FUN,
	CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	CDCL_UNIT_PROPAGATION_FUN,
	CDCL_UNIT_PROPAGATION_INPUT,
	CDCL_UNSTACK_CLAUSE_SET_FUN,
	CDCL_UNSTACK_CLAUSE_SET_INPUT,
	CDCL_VARIABLE_IN_CC_FUN,
	CDCL_VARIABLE_IN_CC_INPUT,
	CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
} from './cdcl-domain.svelte.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import type { CDCL_StateMachine } from './cdcl-state-machine.svelte.ts';
import {
	incrementCheckingIndex,
	updateClausesToCheck
} from '$lib/store/conflict-detection-state.svelte.ts';
import type { ConflictAnalysis, ConflictDetection } from '../SolverMachine.svelte.ts';
import VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';

export const initialTransition = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.stateMachine;
	ecTransition(stateMachine);
	if (stateMachine.onFinalState()) return;
	const complementaryClauses: Set<number> = ucdTransition(stateMachine);
	conflictDetectionBlock(solver, stateMachine, -1, complementaryClauses);
};

const conflictDetectionBlock = (
	solver: CDCL_SolverMachine,
	stateMachine: CDCL_StateMachine,
	variable: number,
	complementaryClauses: Set<number>
): void => {
	const triggeredClauses: boolean = triggeredClausesTransition(
		stateMachine,
		solver,
		complementaryClauses
	);
	if (!triggeredClauses) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	queueClauseSetTransition(stateMachine, solver, variable, complementaryClauses);
	const pendingClausesSet: boolean = checkPendingClausesSetTransition(stateMachine, solver);
	if (!pendingClausesSet) {
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	const clausesToCheck = pickClauseSetTransition(stateMachine, solver);
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clausesToCheck);
	if (allClausesChecked) {
		logFatal('This is not a possibility in this case');
	}
};

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

const ucdTransition = (stateMachine: CDCL_StateMachine): Set<number> => {
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
	const result: Set<number> = ucdState.run();
	stateMachine.transition('triggered_clauses_state');
	return result;
};

const triggeredClausesTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine,
	complementaryClauses: Set<number>
): boolean => {
	const triggeredClausesState = stateMachine.getActiveState() as NonFinalState<
		CDCL_TRIGGERED_CLAUSES_FUN,
		CDCL_TRIGGERED_CLAUSES_INPUT
	>;
	if (triggeredClausesState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Triggered Clauses state');
	}
	const result: boolean = triggeredClausesState.run(complementaryClauses);
	if (result) {
		stateMachine.transition('queue_clause_set_state');
	} else if (!result && solver.thereArePostponed()) stateMachine.transition('delete_clause_state');
	else stateMachine.transition('all_variables_assigned_state');
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

const queueClauseSetTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine,
	variable: number,
	clauseSet: Set<number>
): void => {
	const queueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_QUEUE_CLAUSE_SET_FUN,
		CDCL_QUEUE_CLAUSE_SET_INPUT
	>;
	if (queueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause Set state');
	}
	const size: number = queueClauseSetState.run(variable, clauseSet, solver);
	if (size > 1) stateMachine.transition('delete_clause_state');
	else stateMachine.transition('check_pending_clauses_state');
};

const checkPendingClausesSetTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): boolean => {
	const checkPendingClausesSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CHECK_PENDING_CLAUSES_FUN,
		CDCL_CHECK_PENDING_CLAUSES_INPUT
	>;
	if (checkPendingClausesSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pending Clauses Set state');
	}
	const result: boolean = checkPendingClausesSetState.run(solver);
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
		logFatal('Function call error', 'There should be a function in the All Clausees Checked state');
	}
	const result: boolean = allClausesCheckedState.run(clauses);
	if (result) stateMachine.transition('unstack_clause_set_state');
	else stateMachine.transition('next_clause_state');
	return result;
};

export const analyzeClause = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.stateMachine;
	const pendingConflict: ConflictDetection = solver.consultPostponed();
	const clauseSet: Set<number> = pendingConflict.clauses;
	const clauseId: number = nextClauseTransition(stateMachine, clauseSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine, clauseId);
	if (conflict) {
		updateLastTrailEnding(clauseId);
		emptyClauseSetTransition(stateMachine, solver);
		decisionLevelTransition(stateMachine);
		buildConflictAnalysisTransition(stateMachine, solver);

		const conflictAnalysis: ConflictAnalysis | undefined = solver.consultConflictAnalysis();

		if (conflictAnalysis === undefined) {
			logFatal('Error', 'The conflict analysis has not been saved correctly');
		}
		const isAsserting: boolean = assertingClauseTransition(stateMachine, solver);
		if (isAsserting) {
			logFatal('Error', 'It is not possible for the CC to be asserting');
		}
		return;
	}
	const unitClause: boolean = unitClauseTransition(stateMachine, clauseId);
	if (unitClause) {
		const literalToPropagate: number = unitPropagationTransition(stateMachine, clauseId);
		const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
			stateMachine,
			literalToPropagate
		);
		const triggeredClauses: boolean = triggeredClausesTransition(
			stateMachine,
			solver,
			complementaryClauses
		);
		if (triggeredClauses) {
			queueClauseSetTransition(
				stateMachine,
				solver,
				Math.abs(literalToPropagate),
				complementaryClauses
			);
		}
	}
	deleteClauseTransition(stateMachine, clauseSet, clauseId);
	const allChecked: boolean = allClausesCheckedTransition(stateMachine, clauseSet);
	if (!allChecked) return;
	unstackClauseSetTransition(stateMachine, solver);
	const pendingClausesSet: boolean = checkPendingClausesSetTransition(stateMachine, solver);
	if (!pendingClausesSet) {
		updateClausesToCheck(new Set<number>(), -1);
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	const clausesToCheck = pickClauseSetTransition(stateMachine, solver);
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clausesToCheck);
	if (allClausesChecked) {
		logFatal('This is not a possibility in this case');
	}
};

const nextClauseTransition = (stateMachine: CDCL_StateMachine, clauseSet: Set<number>): number => {
	const nextCluaseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_NEXT_CLAUSE_FUN,
		CDCL_NEXT_CLAUSE_INPUT
	>;
	if (nextCluaseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	const clauseId: number = nextCluaseState.run(clauseSet);
	incrementCheckingIndex();
	stateMachine.transition('conflict_detection_state');
	return clauseId;
};

const conflictDetectionTransition = (
	stateMachine: CDCL_StateMachine,
	clauseId: number
): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CONFLICT_DETECTION_FUN,
		CDCL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseId);
	if (result) stateMachine.transition('empty_clause_set_state');
	else stateMachine.transition('unit_clause_state');
	return result;
};

const decisionLevelTransition = (stateMachine: CDCL_StateMachine): void => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<
		CDCL_CHECK_NON_DECISION_MADE_FUN,
		CDCL_CHECK_NON_DECISION_MADE_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const result: boolean = decisionLevelState.run();
	if (result) stateMachine.transition('unsat_state');
	else stateMachine.transition('build_conflict_analysis_state');
};

const unitClauseTransition = (stateMachine: CDCL_StateMachine, clauseId: number): boolean => {
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
	const result: boolean = unitClauseState.run(clauseId);
	if (result) stateMachine.transition('unit_propagation_state');
	else stateMachine.transition('delete_clause_state');
	return result;
};

const deleteClauseTransition = (
	stateMachine: CDCL_StateMachine,
	clauseSet: Set<number>,
	clauseId: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		CDCL_DELETE_CLAUSE_FUN,
		CDCL_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(clauseSet, clauseId);
	stateMachine.transition('all_clauses_checked_state');
};

const unstackClauseSetTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): void => {
	const dequeueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNSTACK_CLAUSE_SET_FUN,
		CDCL_UNSTACK_CLAUSE_SET_INPUT
	>;
	if (dequeueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Dequeue Clause Set state');
	}
	dequeueClauseSetState.run(solver);
	stateMachine.transition('check_pending_clauses_state');
};

const unitPropagationTransition = (stateMachine: CDCL_StateMachine, clauseId: number): number => {
	const unitPropagationState = stateMachine.getActiveState() as NonFinalState<
		CDCL_UNIT_PROPAGATION_FUN,
		CDCL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const literalToPropagate: number = unitPropagationState.run(clauseId);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const complementaryOccurrencesTransition = (
	stateMachine: CDCL_StateMachine,
	literalToPropagate: number
): Set<number> => {
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
	const clauses: Set<number> = complementaryOccurrencesState.run(literalToPropagate);
	stateMachine.transition('triggered_clauses_state');
	return clauses;
};

export const decide = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.stateMachine;
	const literalToPropagate: number = decideTransition(stateMachine);
	const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
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

const emptyClauseSetTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		CDCL_EMPTY_CLAUSE_SET_FUN,
		CDCL_EMPTY_CLAUSE_SET_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};

// ** cdcl transition **

export const conflictAnalysis = (solver: CDCL_SolverMachine): void => {
	const stateMachine: CDCL_StateMachine = solver.stateMachine;
	const conflictAnalysis: ConflictAnalysis = solver.consultConflictAnalysis() as ConflictAnalysis;
	const lastAssignment: VariableAssignment = pickLastAssignmentTransition(
		stateMachine,
		conflictAnalysis
	);
	const variableAppear: boolean = variableInCCTransition(
		stateMachine,
		conflictAnalysis,
		lastAssignment
	);
	if (variableAppear) {
		resolutionUpdateCCTransition(stateMachine, solver, conflictAnalysis, lastAssignment);
	}
	deleteLastAssignmentTransition(stateMachine, conflictAnalysis);
	const isAsserting: boolean = assertingClauseTransition(stateMachine, solver);
	if (!isAsserting) {
		return;
	}
	const clauseId: number = learnConflictClauseTransition(stateMachine, conflictAnalysis);
	const secondHighestDL: number = getSecondHighestDLTransition(stateMachine, conflictAnalysis);
	backjumpingTransition(stateMachine, conflictAnalysis, secondHighestDL);
	pushTrailTransition(stateMachine, conflictAnalysis);
	const literalToPropagate = propagateCCTransition(stateMachine, clauseId);
	const complementaryClauses: Set<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};

const buildConflictAnalysisTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine
) => {
	const buildConflictAnalysisState = stateMachine.getActiveState() as NonFinalState<
		CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
		CDLC_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
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
	conflictAnalysis: ConflictAnalysis
) => {
	const pickLastAssignmentState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PICK_LAST_ASSIGNMENT_FUN,
		CDCL_PICK_LAST_ASSIGNMENT_INPUT
	>;
	if (pickLastAssignmentState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pick Last Assignment state');
	}
	const assignment: VariableAssignment = pickLastAssignmentState.run(conflictAnalysis.trail);
	stateMachine.transition('variable_in_cc_state');
	return assignment;
};

const variableInCCTransition = (
	stateMachine: CDCL_StateMachine,
	conflictAnalysis: ConflictAnalysis,
	lastAssignment: VariableAssignment
) => {
	const variableInCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_VARIABLE_IN_CC_FUN,
		CDCL_VARIABLE_IN_CC_INPUT
	>;
	if (variableInCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const variableAppears: boolean = variableInCCState.run(
		conflictAnalysis.conflictClause,
		lastAssignment
	);
	if (variableAppears) stateMachine.transition('resolution_update_cc_state');
	else stateMachine.transition('delete_last_assignment_state');
	return variableAppears;
};

const resolutionUpdateCCTransition = (
	stateMachine: CDCL_StateMachine,
	solver: CDCL_SolverMachine,
	conflictAnalysis: ConflictAnalysis,
	lastAssignment: VariableAssignment
) => {
	const resolutionUpdateCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_RESOLUTION_UPDATE_CC_FUN,
		CDCL_RESOLUTION_UPDATE_CC_INPUT
	>;
	if (resolutionUpdateCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	resolutionUpdateCCState.run(solver, conflictAnalysis.conflictClause, lastAssignment);
	stateMachine.transition('delete_last_assignment_state');
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
		CDCL_LEARN_CONCLICT_CLAUSE_FUN,
		CDCL_LEARN_CONCLICT_CLAUSE_INPUT
	>;
	if (learnConflictClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const clauseId: number = learnConflictClauseState.run(
		conflictAnalysis.trail,
		conflictAnalysis.conflictClause
	);
	stateMachine.transition('second_highest_dl_state');
	return clauseId;
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

const propagateCCTransition = (stateMachine: CDCL_StateMachine, clauseId: number): number => {
	const propagateCCState = stateMachine.getActiveState() as NonFinalState<
		CDCL_PROPAGATE_CC_FUN,
		CDCL_PROPAGATE_CC_INPUT
	>;
	if (propagateCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Propagate Conflict Clause state');
	}
	const literalToPropagate: number = propagateCCState.run(clauseId);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

