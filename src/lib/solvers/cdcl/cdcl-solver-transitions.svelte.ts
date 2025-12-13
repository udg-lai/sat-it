import type Clause from '$lib/entities/Clause.svelte.ts';
import type {
	ConflictAnalysis,
	Resolution,
	VirtualResolution
} from '$lib/entities/ConflictAnalysis.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import { conflictDetectionEventBus, toggleTrailViewEventBus } from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { focusOnAssignment } from '$lib/states/inspect-assignment.svelte.ts';
import { getOccurrenceList, updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { fromRight, isLeft, isRight } from '$lib/types/either.ts';
import { makeJust, makeNothing } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	CDCL_ALL_VARIABLES_ASSIGNED_FUN,
	CDCL_ALL_VARIABLES_ASSIGNED_INPUT,
	CDCL_ASSERTING_CLAUSE_FUN,
	CDCL_ASSERTING_CLAUSE_INPUT,
	CDCL_AT_LEVEL_ZERO_FUN,
	CDCL_AT_LEVEL_ZERO_INPUT,
	CDCL_BACKJUMPING_FUN,
	CDCL_BACKJUMPING_INPUT,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
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
	CDCL_LEARN_CONFLICT_CLAUSE_FUN,
	CDCL_LEARN_CONFLICT_CLAUSE_INPUT,
	CDCL_NEXT_OCCURRENCE_FUN,
	CDCL_NEXT_OCCURRENCE_INPUT,
	CDCL_PICK_OCCURRENCE_LIST_FUN,
	CDCL_PICK_OCCURRENCE_LIST_INPUT,
	CDCL_PROPAGATE_CC_FUN,
	CDCL_PROPAGATE_CC_INPUT,
	CDCL_PUSH_TRAIL_FUN,
	CDCL_PUSH_TRAIL_INPUT,
	CDCL_QUEUE_OCCURRENCE_LIST_FUN,
	CDCL_QUEUE_OCCURRENCE_LIST_INPUT,
	CDCL_SECOND_HIGHEST_DL_FUN,
	CDCL_SECOND_HIGHEST_DL_INPUT,
	CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
	CDCL_TRAVERSED_OCCURRENCE_LIST_INPUT,
	CDCL_UNIT_CLAUSE_FUN,
	CDCL_UNIT_CLAUSE_INPUT,
	CDCL_UNIT_CLAUSES_DETECTION_FUN,
	CDCL_UNIT_CLAUSES_DETECTION_INPUT,
	CDCL_UNIT_PROPAGATION_FUN,
	CDCL_UNIT_PROPAGATION_INPUT,
	CDCL_VIRTUAL_RESOLUTION_FUN,
	CDCL_VIRTUAL_RESOLUTION_INPUT,
	CDCL_WIPE_OCCURRENCE_QUEUE_FUN,
	CDCL_WIPE_OCCURRENCE_QUEUE_INPUT
} from './cdcl-domain.svelte.ts';
import type { CDCL_SolverMachine } from './cdcl-solver-machine.svelte.ts';
import type { CDCL_StateMachine } from './cdcl-state-machine.svelte.ts';

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

export const preConflictAnalysis = () => {
	wipeOccurrenceQueueTransition();
	if (dlZeroCheck()) {
		getSolverMachine().transition('unsat_state');
	} else {
		getSolverMachine().transition('build_conflict_analysis_state');
	}
	buildConflictAnalysisTransition();

	// This is keep now, when the chronological backtracking is implemented,
	// the conflictive clause might actually be asserting.
	const asserting: boolean = assertingClauseInConflictAnalysis();
	if (asserting) {
		logFatal(
			'CDCL Conflict Analysis',
			'The conflict clause should not be asserting (non-chronological backtracking)'
		);
	}
	conflictAnalysisBlock();
};

export const conflictAnalysisBlock = (): void => {
	const virtualResolution: VirtualResolution = virtualResolutionTransition();

	if (isLeft(virtualResolution)) {
		// No job done by the resolution procedure, the clause remains the same
		getLatestTrail().updateResolutionContext(undefined);
	}

	const { resolvent } = fromRight(virtualResolution);
	getLatestTrail().updateResolutionContext(resolvent.clause);

	const asserting: boolean = assertingClauseInConflictAnalysis();

	if (asserting && resolvent.asserting) // This is kinda stupid but (resolvent.asserting -> asserting)
	{
		const cRef: CRef = learnConflictClauseTransition();
		const sndHighestDL: number = getSecondHighestDLTransition();
		backjumpingTransition(secondHighestDL);

	}




	if (!asserting) {
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
		const isConflictive: boolean = conflictiveTransition(solver, cRef);
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
		solver.transition('are_remaining_occurrences_state');
	} else {
		logFatal('CDCL Solver Transition Error', "Occurrences Queue shouldn't be empty here");
	}
};

const checkPendingOccurrenceListsTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
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
	if (pendingOcc) getSolverMachine().transition('pick_occurrence_list_state');
	else getSolverMachine().transition('all_variables_assigned_state');
	return pendingOcc;
};

const pickOccurrenceListTransition = (): OccurrenceList => {
	// This method just updates the occurrences lits view with the first occurrence list in the queue.
	const state = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_PICK_OCCURRENCE_LIST_FUN,
		CDCL_PICK_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'No function defined for picking the occurrence list');
	}
	const occurrenceList: OccurrenceList = state.run();
	getSolverMachine().transition('all_clauses_checked_state');
	return occurrenceList;
};

const traversedOccurrenceListTransition = (): boolean => {
	const allOccurrencesCheckedState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_TRAVERSED_OCCURRENCE_LIST_FUN,
		CDCL_TRAVERSED_OCCURRENCE_LIST_INPUT
	>;
	if (allOccurrencesCheckedState.run === undefined) {
		logFatal('Function call error', 'A function that validates all occurrences checked is needed');
	}
	const occurrenceList: OccurrenceList = getOccurrenceList();
	const traversed: boolean = allOccurrencesCheckedState.run(occurrenceList);
	if (traversed) getSolverMachine().transition('dequeue_occurrence_list_state');
	else getSolverMachine().transition('next_clause_state');
	return traversed;
};

const nextOccurrenceTransition = (): number => {
	// Takes from the `head` of the occurrencesQueue the set of clauses to be checked
	const state = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_NEXT_OCCURRENCE_FUN,
		CDCL_NEXT_OCCURRENCE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	// Returns the next clause to be checked from the occurrence list at the head of the queue
	const cRef: number = state.run();
	getSolverMachine().transition('falsified_clause_state');
	return cRef;
};

const conflictiveTransition = (cRef: CRef): boolean => {
	const conflictDetectionState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_CONFLICT_DETECTION_FUN,
		CDCL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const falsified: boolean = conflictDetectionState.run(cRef);
	if (falsified) getSolverMachine().transition('empty_occurrence_lists_state');
	else getSolverMachine().transition('unit_clause_state');
	return falsified;
};

const dlZeroCheck = (): boolean => {
	const decisionLevelState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_AT_LEVEL_ZERO_FUN,
		CDCL_AT_LEVEL_ZERO_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	return decisionLevelState.run();
};

const unitClauseTransition = (cRef: CRef): boolean => {
	const unitClauseState = getSolverMachine().getActiveState() as NonFinalState<
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
	if (isUnit) getSolverMachine().transition('unit_propagation_state');
	else getSolverMachine().transition('all_clauses_checked_state');
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
	solver.transition('are_remaining_occurrences_state');
};

const unitPropagationTransition = (cRef: CRef): Lit => {
	const unitPropagationState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_UNIT_PROPAGATION_FUN,
		CDCL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const propagated: Lit = unitPropagationState.run(cRef);
	getSolverMachine().transition('complementary_occurrences_state');
	return propagated;
};

const complementaryOccurrencesDetectionTransition = (assignment: Lit): OccurrenceList => {
	const complementaryOccurrencesState = getSolverMachine().getActiveState() as NonFinalState<
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
	getSolverMachine().transition('queue_occurrence_list_state');
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

const wipeOccurrenceQueueTransition = (): void => {
	const wipeOccurrencesState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_WIPE_OCCURRENCE_QUEUE_FUN,
		CDCL_WIPE_OCCURRENCE_QUEUE_INPUT
	>;
	if (wipeOccurrencesState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Empty Occurrence Lists state'
		);
	}
	wipeOccurrencesState.run();
	getSolverMachine().transition('at_level_zero_state');
};

// ** cdcl transition **

const buildConflictAnalysisTransition = () => {
	const buildConflictAnalysisState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
		CDCL_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	>;
	if (buildConflictAnalysisState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Build Conflict Analysis state'
		);
	}
	buildConflictAnalysisState.run();
	getSolverMachine().transition('asserting_clause_state');
};

const assertingClauseInConflictAnalysis = (): boolean => {
	const assertingClauseState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_ASSERTING_CLAUSE_FUN,
		CDCL_ASSERTING_CLAUSE_INPUT
	>;
	if (assertingClauseState.run === undefined) {
		logFatal(
			'Asserting clause transition',
			'There should be a function in the Asserting Clause state'
		);
	}
	const isAsserting: boolean = assertingClauseState.run();
	if (isAsserting) getSolverMachine().transition('learn_cc_state');
	else getSolverMachine().transition('virtual_resolution_state');
	return isAsserting;
};

const virtualResolutionTransition = () => {
	const virtualResolutionState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_VIRTUAL_RESOLUTION_FUN,
		CDCL_VIRTUAL_RESOLUTION_INPUT
	>;
	if (virtualResolutionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pick Last Assignment state');
	}
	const virtualResolution: VirtualResolution = virtualResolutionState.run();
	getSolverMachine().transition('asserting_clause_state');
	return virtualResolution;
};

const learnConflictClauseTransition = (): CRef => {
	const learnConflictClauseState = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_LEARN_CONFLICT_CLAUSE_FUN,
		CDCL_LEARN_CONFLICT_CLAUSE_INPUT
	>;
	if (learnConflictClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}

	const conflictAnalysis: ConflictAnalysis = getConflictAnalysis();

	if (!conflictAnalysis.hasAssertiveClause()) {
		logFatal(
			'CDCL Conflict Analysis',
			'The conflict clause should be assertive before learning it'
		);
	}

	const resolvent: Clause = conflictAnalysis.getClause();
	learnConflictClauseState.run(resolvent);
	getSolverMachine().transition('second_highest_dl_state');
	return resolvent.getCRef();
};

const getSecondHighestDLTransition = (cRef: CRef) => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_SECOND_HIGHEST_DL_FUN,
		CDCL_SECOND_HIGHEST_DL_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}

	const clause: Clause = getClausePool().at(cRef);
	const sndHighestDL: number = state.run(clause);
	getSolverMachine().transition('undo_backjumping_state');
	return sndHighestDL;
};

const backjumpingTransition = (secondHighestDL: number) => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		CDCL_BACKJUMPING_FUN,
		CDCL_BACKJUMPING_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	state.run(conflictAnalysis.trail, secondHighestDL);
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
