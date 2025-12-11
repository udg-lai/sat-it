import type Clause from '$lib/entities/Clause.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import { conflictDetectionEventBus, toggleTrailViewEventBus } from '$lib/events/events.ts';
import { focusOnAssignment } from '$lib/states/inspect-assignment.svelte.ts';
import { updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { makeJust, makeNothing } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	CDCL_ALL_CLAUSES_CHECKED_INPUT,
	CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
	CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	CDCL_ALL_VARIABLES_ASSIGNED_INPUT,
	CDCL_ASSERTING_CLAUSE_FUN,
	CDCL_ASSERTING_CLAUSE_INPUT,
	CDCL_BACKJUMPING_FUN,
	CDCL_BACKJUMPING_INPUT,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
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
	CDCL_UNSTACK_OCCURRENCE_LIST_FUN as CDCL_DEQUEUE_OCCURRENCE_LIST_FUN,
	CDCL_UNSTACK_OCCURRENCE_LIST_INPUT as CDCL_DEQUEUE_OCCURRENCE_LIST_INPUT,
	CDCL_EMPTY_CLAUSE_FUN,
	CDCL_EMPTY_CLAUSE_INPUT,
	CDCL_EMPTY_OCCURRENCE_LISTS_FUN,
	CDCL_EMPTY_OCCURRENCE_LISTS_INPUT,
	CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	CDCL_LEARN_CONFLICT_CLAUSE_INPUT,
	CDCL_NEXT_OCCURRENCE_FUN,
	CDCL_NEXT_OCCURRENCE_INPUT,
	CDCL_VIRTUAL_RESOLUTION_FUN,
	CDCL_VIRTUAL_RESOLUTION_INPUT,
	CDCL_PICK_OCCURRENCE_LIST_FUN as CDCL_PICK_OCCURRENCE_LIST_FUN,
	CDCL_PICK_CLAUSE_SET_INPUT as CDCL_PICK_OCCURRENCE_LIST_INPUT,
	CDCL_PROPAGATE_CC_FUN,
	CDCL_PROPAGATE_CC_INPUT,
	CDCL_PUSH_TRAIL_FUN,
	CDCL_PUSH_TRAIL_INPUT,
	CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	CDCL_QUEUE_OCCURRENCE_LIST_INPUT,
	CDCL_SECOND_HIGHEST_DL_FUN,
	CDCL_SECOND_HIGHEST_DL_INPUT,
	CDCL_UNIT_CLAUSE_FUN,
	CDCL_UNIT_CLAUSE_INPUT,
	CDCL_UNIT_CLAUSES_DETECTION_FUN,
	CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	CDCL_UNIT_PROPAGATION_FUN,
	CDCL_UNIT_PROPAGATION_INPUT
} from './cdcl-domain.svelte.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import type { CDCL_StateMachine } from './cdcl-state-machine.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import type { ConflictAnalysis } from '$lib/entities/ConflictAnalysis.svelte.ts';

/* exported transitions */

export const initialTransition = (solver: CDCL_SolverMachine): void => {
	ecTransition(solver.getStateMachine());
	if (solver.onFinalState()) return;
	const unitClauses: Set<CRef> = ucdTransition(solver.getStateMachine());
	const occurrenceList: OccurrenceList = new OccurrenceList(makeNothing(), [...unitClauses]);
	afterComplementaryBlock(solver, occurrenceList);
};

export const preConflictDetection = (solver: CDCL_SolverMachine): void => {
	conflictDetectionBlock(solver);
};

export const decide = (solver: CDCL_SolverMachine): void => {
	const assignment: Lit = decideTransition(solver);
	const occurrenceList: OccurrenceList = complementaryOccurrencesDetectionTransition(
		solver,
		assignment
	);
	afterComplementaryBlock(solver, occurrenceList);
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
	conflictAnalysisBlock(solver);
};

export const conflictAnalysisBlock = (solver: CDCL_SolverMachine): void => {
	const conflictAnalysis: ConflictAnalysis = getConflictAnalysis();
	const cc: Clause = conflictAnalysis.getClause();

	const lastAssignment: VariableAssignment = VirtualResolutionTransition(
		solver.getStateMachine(),
		conflictAnalysis
	);

	if (!lastAssignment.wasPropagated()) {
		logError(
			'CDCL Conflict Analysis',
			'The last assignment in the conflict analysis should be a unit propagation'
		);
	}

	const complementaryAppear: boolean = complementaryInCCTransition(solver, lastAssignment, cc);
	const latestTrail: Trail | undefined = getLatestTrail();
	if (latestTrail === undefined) logFatal('CDCL solver', 'Latest trail should not be undefined');

	if (complementaryAppear) {
		const resolvent: Clause = resolutionUpdateCCTransition(solver, lastAssignment, cc);
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
		focusOnAssignment(conflictAnalysis.trail.last().getVariable().toInt());
		return;
	}
	const cRef: CRef = learnConflictClauseTransition(solver);
	const secondHighestDL: number = getSecondHighestDLTransition(stateMachine, conflictAnalysis);
	backjumpingTransition(stateMachine, conflictAnalysis, secondHighestDL);
	pushTrailTransition(stateMachine, conflictAnalysis);
	const propagated: Lit = propagateCCTransition(stateMachine, cRef);

	(getLatestTrail() as Trail).setFollowUpIndex();

	const occurrenceList: OccurrenceList = complementaryOccurrencesDetectionTransition(
		solver,
		propagated
	);

	afterComplementaryBlock(solver, occurrenceList);
};

/* General non-exported transitions */

const afterComplementaryBlock = (
	solver: CDCL_SolverMachine,
	occurrenceList: OccurrenceList
): void => {
	queueOccurrenceListTransition(solver, occurrenceList);
	const thereAreOccurrences: boolean = checkPendingOccurrenceListsTransition(solver);
	if (thereAreOccurrences) {
		pickOccurrenceListTransition(solver);
	} else {
		allVariablesAssignedTransition(solver);
	}
	if (!solver.isInAutoMode()) conflictDetectionEventBus.emit();
};

const conflictDetectionBlock = (solver: CDCL_SolverMachine): void => {
	const traversedOccurrenceList = traversedOccurrenceListTransition(solver);
	if (traversedOccurrenceList) {
		dequeueOccurrenceListTransition(solver);
		const pendingOcc: boolean = checkPendingOccurrenceListsTransition(solver);
		if (pendingOcc) {
			pickOccurrenceListTransition(solver);
		} else {
			updateOccurrenceList(new OccurrenceList());
			allVariablesAssignedTransition(solver);
		}
	} else {
		const cRef: CRef = nextOccurrenceTransition(solver);
		const isConflictive: boolean = conflictDetectionTransition(solver, cRef);
		if (isConflictive) {
			getLatestTrail().attachConflictiveClause(getClausePool().at(cRef));
			toggleTrailViewEventBus.emit();
		} else {
			const unitClause: boolean = unitClauseTransition(solver, cRef);
			if (unitClause) {
				const propagated: Lit = unitPropagationTransition(solver, cRef);
				const occurrenceList: OccurrenceList = complementaryOccurrencesDetectionTransition(
					solver,
					propagated
				);
				queueOccurrenceListTransition(solver, occurrenceList);
			}
		}
	}
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

const allVariablesAssignedTransition = (solver: CDCL_SolverMachine): void => {
	const allVariablesAssignedState = solver.getActiveState() as NonFinalState<
		CDCL_ALL_VARIABLES_ASSIGNED_FUN,
		CDCL_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (allVariablesAssignedState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const allAssigned: boolean = allVariablesAssignedState.run();
	if (allAssigned) solver.transition('sat_state');
	else solver.transition('decide_state');
};

const queueOccurrenceListTransition = (
	solver: CDCL_SolverMachine,
	occurrenceList: OccurrenceList
): void => {
	const state = solver.getActiveState() as NonFinalState<
		CDCL_QUEUE_OCCURRENCE_LIST_FUN,
		CDCL_QUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Queue Occurrence List state'
		);
	}
	state.run(occurrenceList);
	// NOTE: This transition is being used in two places in the cdcl solver diagram.
	const queueSize = getOccurrenceListQueue().size();
	if (queueSize > 1) {
		// This means, we came from UP and complementary occurrence detection
		solver.transition('all_clauses_checked_state');
	} else if (queueSize === 1) {
		// This means we came from initial UPs or decide transitions
		solver.transition('check_pending_occurrence_lists_state');
	} else {
		logFatal('CDCL Solver Transition Error', "Occurrences Queue shouldn't be empty here");
	}
};

const checkPendingOccurrenceListsTransition = (solver: CDCL_SolverMachine): boolean => {
	const state = solver.getActiveState() as NonFinalState<
		CDCL_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
		CDCL_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'Function to check if there are pending occurrence lists is missing'
		);
	}
	const pendingOcc: boolean = state.run();
	if (pendingOcc) solver.transition('pick_clause_set_state');
	else solver.transition('all_variables_assigned_state');
	return pendingOcc;
};

const pickOccurrenceListTransition = (solver: CDCL_SolverMachine): OccurrenceList => {
	// This method just updates the occurrences lits view with the first occurrence list in the queue.
	const state = solver.getActiveState() as NonFinalState<
		CDCL_PICK_OCCURRENCE_LIST_FUN,
		CDCL_PICK_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'No function defined for picking the occurrence list');
	}
	const occurrenceList: OccurrenceList = state.run();
	solver.transition('all_clauses_checked_state');
	return occurrenceList;
};

const traversedOccurrenceListTransition = (solver: CDCL_SolverMachine): boolean => {
	const allOccurrencesCheckedState = solver.getActiveState() as NonFinalState<
		CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
		CDCL_ALL_CLAUSES_CHECKED_INPUT
	>;
	if (allOccurrencesCheckedState.run === undefined) {
		logFatal('Function call error', 'A function that validates all occurrences checked is needed');
	}
	const occurrenceList: OccurrenceList = getOccurrenceListQueue().element();
	const traversed: boolean = allOccurrencesCheckedState.run(occurrenceList);
	if (traversed) solver.transition('dequeue_occurrence_list_state');
	else solver.transition('next_occurrence_state');
	return traversed;
};

const nextOccurrenceTransition = (solver: CDCL_SolverMachine): number => {
	// Takes from the `head` of the occurrencesQueue the set of clauses to be checked
	const state = solver.getActiveState() as NonFinalState<
		CDCL_NEXT_OCCURRENCE_FUN,
		CDCL_NEXT_OCCURRENCE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	// Returns the next clause to be checked from the occurrence list at the head of the queue
	const cRef: number = state.run(getOccurrenceListQueue().element());
	solver.transition('conflict_detection_state');
	return cRef;
};

const conflictDetectionTransition = (solver: CDCL_SolverMachine, cRef: CRef): boolean => {
	const conflictDetectionState = solver.getActiveState() as NonFinalState<
		CDCL_CONFLICT_DETECTION_FUN,
		CDCL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const falsified: boolean = conflictDetectionState.run(cRef);
	if (falsified) solver.transition('empty_occurrence_lists_state');
	else solver.transition('unit_clause_state');
	return falsified;
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

const unitClauseTransition = (solver: CDCL_SolverMachine, cRef: CRef): boolean => {
	const unitClauseState = solver.getActiveState() as NonFinalState<
		CDCL_UNIT_CLAUSE_FUN,
		CDCL_UNIT_CLAUSE_INPUT
	>;
	if (unitClauseState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const isUnit: boolean = unitClauseState.run(cRef);
	if (isUnit) solver.transition('unit_propagation_state');
	else solver.transition('all_clauses_checked_state');
	return isUnit;
};

const dequeueOccurrenceListTransition = (solver: CDCL_SolverMachine): void => {
	// This transition removes the first Occurrence List from the occurrencesQueue.
	// Of the CDCL_SolverMachine.
	const state = solver.getActiveState() as NonFinalState<
		CDCL_DEQUEUE_OCCURRENCE_LIST_FUN,
		CDCL_DEQUEUE_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unstack Occurrence List state'
		);
	}
	state.run(solver);
	solver.transition('check_pending_occurrence_lists_state');
};

const unitPropagationTransition = (solver: CDCL_SolverMachine, cRef: CRef): Lit => {
	const unitPropagationState = solver.getActiveState() as NonFinalState<
		CDCL_UNIT_PROPAGATION_FUN,
		CDCL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const propagated: Lit = unitPropagationState.run(cRef);
	solver.transition('complementary_occurrences_state');
	return propagated;
};

const complementaryOccurrencesDetectionTransition = (
	solver: CDCL_SolverMachine,
	assignment: Lit
): OccurrenceList => {
	const complementaryOccurrencesState = solver.getActiveState() as NonFinalState<
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
	solver.transition('queue_occurrence_list_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new OccurrenceList(makeJust(complementary), [...clauses]);
};

const decideTransition = (solver: CDCL_SolverMachine): number => {
	const decideState = solver.getActiveState() as NonFinalState<CDCL_DECIDE_FUN, CDCL_DECIDE_INPUT>;
	if (decideState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const decision: Lit = decideState.run();
	solver.transition('complementary_occurrences_state');
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

const VirtualResolutionTransition = (
	stateMachine: CDCL_StateMachine,
	{ trail }: ConflictAnalysis
) => {
	const virtualResolutionState = stateMachine.getActiveState() as NonFinalState<
		CDCL_VIRTUAL_RESOLUTION_FUN,
		CDCL_VIRTUAL_RESOLUTION_INPUT
	>;
	if (virtualResolutionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pick Last Assignment state');
	}
	const assignment: VariableAssignment = virtualResolutionState.run(trail);
	stateMachine.transition('complementary_in_ccc_state_state');
	return assignment;
};

const complementaryInCCTransition = (
	solver: CDCL_SolverMachine,
	lastAssignment: VariableAssignment,
	cc: Clause
) => {
	const complementaryInCCState = solver.getActiveState() as NonFinalState<
		CDCL_COMPLEMENTARY_IN_CCC_FUN,
		CDCL_COMPLEMENTARY_IN_CCC_INPUT
	>;
	if (complementaryInCCState.run === undefined) {
		logFatal('Complementary In CC', 'No function defined in the Complementary In CC state');
	}

	const complementaryExists: boolean = complementaryInCCState.run(cc, lastAssignment);
	if (complementaryExists) solver.transition('resolution_update_cc_state');
	else solver.transition('delete_last_assignment_state');
	return complementaryExists;
};

const resolutionUpdateCCTransition = (
	solver: CDCL_SolverMachine,
	lastAssignment: VariableAssignment,
	cc: Clause
): Clause => {
	const resolutionUpdateCCState = solver.getActiveState() as NonFinalState<
		CDCL_RESOLUTION_UPDATE_CC_FUN,
		CDCL_RESOLUTION_UPDATE_CC_INPUT
	>;
	if (resolutionUpdateCCState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const resolvent: Clause = resolutionUpdateCCState.run(solver, cc, lastAssignment);
	solver.transition('delete_last_assignment_state');
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

const learnConflictClauseTransition = (cdclSolver: CDCL_SolverMachine): CRef => {
	const learnConflictClauseState = cdclSolver.getStateMachine().getActiveState() as NonFinalState<
		CDCL_LEARN_CONFLICT_CLAUSE_FUN,
		CDCL_LEARN_CONFLICT_CLAUSE_INPUT
	>;
	if (learnConflictClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const cRef: number = learnConflictClauseState.run(
		cdclSolver.consultConflictAnalysis().trail,
		cdclSolver.consultConflictAnalysis().conflictClause
	);
	cdclSolver.getStateMachine().transition('second_highest_dl_state');
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
