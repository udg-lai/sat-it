import type Clause from '$lib/entities/Clause.svelte.ts';
import type { ConflictAnalysis, VirtualResolution } from '$lib/entities/ConflictAnalysis.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import {
	conflictAnalysisFinishedEventBus,
	conflictDetectedEventBus,
	visitingComplementaryOccEventBus
} from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { focusOnAssignment, wipeFocusAssignment } from '$lib/states/focused-assignment.svelte.ts';
import { getOccurrenceList, updateOccurrenceList } from '$lib/states/occurrence-list.svelte.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { getOccurrenceListQueue } from '$lib/states/queue-occurrence-lists.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { fromRight, isLeft } from '$lib/types/either.ts';
import { makeJust, makeNothing } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	TWATCH_ALL_VARIABLES_ASSIGNED_FUN,
	TWATCH_ALL_VARIABLES_ASSIGNED_INPUT,
	TWATCH_ASSERTING_CLAUSE_FUN,
	TWATCH_ASSERTING_CLAUSE_INPUT,
	TWATCH_AT_LEVEL_ZERO_FUN,
	TWATCH_AT_LEVEL_ZERO_INPUT,
	TWATCH_BACKJUMPING_FUN,
	TWATCH_BACKJUMPING_INPUT,
	TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
	TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT,
	TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
	TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT,
	TWATCH_COMPLEMENTARY_OCCURRENCES_FUN,
	TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT,
	TWATCH_CONFLICT_DETECTION_FUN,
	TWATCH_CONFLICT_DETECTION_INPUT,
	TWATCH_DECIDE_FUN,
	TWATCH_DECIDE_INPUT,
	TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
	TWATCH_LEARN_CONFLICT_CLAUSE_INPUT,
	TWATCH_NEXT_OCCURRENCE_FUN,
	TWATCH_NEXT_OCCURRENCE_INPUT,
	TWATCH_PICK_OCCURRENCE_LIST_FUN,
	TWATCH_PICK_OCCURRENCE_LIST_INPUT,
	TWATCH_PUSH_TRAIL_FUN,
	TWATCH_PUSH_TRAIL_INPUT,
	TWATCH_QUEUE_OCCURRENCE_LIST_FUN,
	TWATCH_QUEUE_OCCURRENCE_LIST_INPUT,
	TWATCH_SECOND_HIGHEST_DL_FUN,
	TWATCH_SECOND_HIGHEST_DL_INPUT,
	TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN,
	TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT,
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	TWATCH_UNIT_CLAUSE_FUN,
	TWATCH_UNIT_CLAUSE_INPUT,
	TWATCH_UNIT_PROPAGATION_FUN,
	TWATCH_UNIT_PROPAGATION_INPUT,
	TWATCH_UNSTACK_OCCURRENCE_LIST_FUN,
	TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT,
	TWATCH_VIRTUAL_RESOLUTION_FUN,
	TWATCH_VIRTUAL_RESOLUTION_INPUT,
	TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
	TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
} from './twatch-domain.svelte.ts';

/* exported transitions */

export const initialTransition = (): void => {
	const unaryEmptyCRefs: Set<CRef> = unaryEmptyClausesTransition();
	const occurrenceList: OccurrenceList = new OccurrenceList(makeNothing(), [...unaryEmptyCRefs]);
	afterComplementaryBlock(occurrenceList);
};

export const decide = (): void => {
	const assignment: Lit = decideTransition();
	const occurrenceList: OccurrenceList = complementaryOccurrencesDetectionTransition(assignment);
	afterComplementaryBlock(occurrenceList);
};

export const preConflictAnalysis = () => {
	wipeOccurrenceQueueTransition();
	if (dlZeroCheck()) {
		getSolverMachine().transition('unsat_state');
	} else {
		getSolverMachine().transition('build_conflict_analysis_state');

		buildConflictAnalysisTransition();

		// This is keep now, when the chronological backtracking is implemented,
		// the conflictive clause might actually be asserting.
		const asserting: boolean = assertingClauseInConflictAnalysis();
		if (asserting) {
			logFatal(
				'CDCL Conflict Analysis',
				'The conflict clause should not be asserting (non-chronological backtracking)'
			);
		} else {
			//In case there is something to apply resolution to, let's highlight it.
			const nextUP: VariableAssignment = getConflictAnalysis().currentImplication();
			focusOnAssignment(nextUP.toLit());
		}
	}
};

export const conflictAnalysisBlock = (): void => {
	const virtualResolution: VirtualResolution = virtualResolutionTransition();

	if (isLeft(virtualResolution)) {
		// No job done by the resolution procedure, the clause remains the same
		getLatestTrail().updateResolutionContext(undefined);
	} else {
		const { resolvent } = fromRight(virtualResolution);
		getLatestTrail().updateResolutionContext(resolvent.clause);
	}

	const asserting: boolean = assertingClauseInConflictAnalysis();

	if (asserting) {
		//This needs to be cleared
		wipeFocusAssignment();
		// This is kinda stupid but (resolvent.asserting -> asserting)
		const cRef: CRef = learnConflictClauseTransition();
		const sndHighestDL: number = getSecondHighestDLTransition(cRef);
		const trailAfterBJ: Trail = backjumpingTransition(getLatestTrail(), sndHighestDL);

		// Push the new trail after backjumping and notify
		pushTrailTransition(trailAfterBJ);

		const propagated: Lit = unitPropagationTransition(cRef, 'backjumping');
		const occurrenceList: OccurrenceList = complementaryOccurrencesDetectionTransition(propagated);

		afterComplementaryBlock(occurrenceList);

		// After the conflict analysis finishes we notify it
		conflictAnalysisFinishedEventBus.emit();
	} else {
		const nextUP: VariableAssignment = getConflictAnalysis().currentImplication();
		focusOnAssignment(nextUP.toLit());
	}
};

/* General non-exported transitions */

const afterComplementaryBlock = (occurrenceList: OccurrenceList): void => {
	queueOccurrenceListTransition(occurrenceList);
	const thereAreOccurrences: boolean = checkPendingOccurrenceListsTransition();
	if (thereAreOccurrences) {
		pickOccurrenceListTransition();
	} else {
		allVariablesAssignedTransition();
	}
	// This is for showing the up-1 and up-n view
	if (!getSolverMachine().runningOnAutomatic()) {
		visitingComplementaryOccEventBus.emit();
	}
};

export const conflictDetectionBlock = (): void => {
	const traversedOccurrenceList = traversedOccurrenceListTransition();
	if (traversedOccurrenceList) {
		unstackOccurrenceListTransition();
		const pendingOcc: boolean = checkPendingOccurrenceListsTransition();
		if (pendingOcc) {
			pickOccurrenceListTransition();
		} else {
			updateOccurrenceList(new OccurrenceList());
			allVariablesAssignedTransition();
		}
	} else {
		const cRef: CRef = nextOccurrenceTransition();
		const isConflictive: boolean = conflictiveTransition(cRef);
		if (isConflictive) {
			getLatestTrail().attachConflictiveClause(getClausePool().at(cRef));
			conflictDetectedEventBus.emit();
		} else {
			const unitClause: boolean = unitClauseTransition(cRef);
			if (unitClause) {
				const propagated: Lit = unitPropagationTransition(cRef, 'up');
				const occurrenceList: OccurrenceList =
					complementaryOccurrencesDetectionTransition(propagated);
				queueOccurrenceListTransition(occurrenceList);
			}
		}
	}
};

/* Specific Transitions */

const unaryEmptyClausesTransition = (): Set<CRef> => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
		TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unary Empty Clauses  Transition state'
		);
	}
	const units: Set<CRef> = state.run();
	getSolverMachine().transition('queue_occurrence_list_state');
	return units;
};

const allVariablesAssignedTransition = (): void => {
	const allVariablesAssignedState = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_ALL_VARIABLES_ASSIGNED_FUN,
		TWATCH_ALL_VARIABLES_ASSIGNED_INPUT
	>;
	if (allVariablesAssignedState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the All Variables Assigned state'
		);
	}
	const allAssigned: boolean = allVariablesAssignedState.run();
	if (allAssigned) getSolverMachine().transition('sat_state');
	else getSolverMachine().transition('decide_state');
};

const queueOccurrenceListTransition = (occurrenceList: OccurrenceList): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_QUEUE_OCCURRENCE_LIST_FUN,
		TWATCH_QUEUE_OCCURRENCE_LIST_INPUT
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
		getSolverMachine().transition('traversed_occurrences_state');
	} else if (queueSize === 1) {
		// This means we came from initial UPs or decide transitions
		getSolverMachine().transition('are_remaining_occurrences_state');
	} else {
		logFatal('CDCL Solver Transition Error', "Occurrences Queue shouldn't be empty here");
	}
};

const checkPendingOccurrenceListsTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN,
		TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
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

const pickOccurrenceListTransition = (): void => {
	// This method just updates the occurrences lits view with the first occurrence list in the queue.
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_PICK_OCCURRENCE_LIST_FUN,
		TWATCH_PICK_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'No function defined for picking the occurrence list');
	}
	state.run();
	getSolverMachine().transition('traversed_occurrences_state');
};

const traversedOccurrenceListTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN,
		TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'A function that validates all occurrences checked is needed');
	}
	const occurrenceList: OccurrenceList = getOccurrenceList();
	const traversed: boolean = state.run(occurrenceList);
	if (traversed) getSolverMachine().transition('dequeue_occurrence_list_state');
	else getSolverMachine().transition('next_clause_state');
	return traversed;
};

const nextOccurrenceTransition = (): CRef => {
	// Takes from the `head` of the occurrencesQueue the set of clauses to be checked
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_NEXT_OCCURRENCE_FUN,
		TWATCH_NEXT_OCCURRENCE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	// Returns the next clause to be checked from the occurrence list at the head of the queue
	const cRef: CRef = state.run();
	getSolverMachine().transition('falsified_clause_state');
	return cRef;
};

const conflictiveTransition = (cRef: CRef): boolean => {
	const conflictDetectionState = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_CONFLICT_DETECTION_FUN,
		TWATCH_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const falsified: boolean = conflictDetectionState.run(cRef);
	if (falsified) getSolverMachine().transition('wipe_occurrences_queue_state');
	else getSolverMachine().transition('unit_clause_state');
	return falsified;
};

const dlZeroCheck = (): boolean => {
	const decisionLevelState = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_AT_LEVEL_ZERO_FUN,
		TWATCH_AT_LEVEL_ZERO_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	return decisionLevelState.run();
};

const unitClauseTransition = (cRef: CRef): boolean => {
	const unitClauseState = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_UNIT_CLAUSE_FUN,
		TWATCH_UNIT_CLAUSE_INPUT
	>;
	if (unitClauseState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const isUnit: boolean = unitClauseState.run(cRef);
	if (isUnit) getSolverMachine().transition('unit_propagation_state');
	else getSolverMachine().transition('traversed_occurrences_state');
	return isUnit;
};

const unstackOccurrenceListTransition = (): void => {
	// This transition removes the first Occurrence List from the occurrencesQueue.
	// Of the CDCL_SolverMachine.
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_UNSTACK_OCCURRENCE_LIST_FUN,
		TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unstack Occurrence List state'
		);
	}
	state.run();
	getSolverMachine().transition('are_remaining_occurrences_state');
};

const unitPropagationTransition = (cRef: CRef, reason: 'up' | 'backjumping'): Lit => {
	const unitPropagationState = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_UNIT_PROPAGATION_FUN,
		TWATCH_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const propagated: Lit = unitPropagationState.run(cRef, reason);
	getSolverMachine().transition('complementary_occurrences_state');
	return propagated;
};

const complementaryOccurrencesDetectionTransition = (assignment: Lit): OccurrenceList => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_COMPLEMENTARY_OCCURRENCES_FUN,
		TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: Set<CRef> = state.run(assignment);
	getSolverMachine().transition('queue_occurrence_list_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new OccurrenceList(makeJust(complementary), [...clauses]);
};

const decideTransition = (): number => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_DECIDE_FUN,
		TWATCH_DECIDE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const decision: Lit = state.run();
	getSolverMachine().transition('complementary_occurrences_state');
	return decision;
};

const wipeOccurrenceQueueTransition = (): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
		TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Empty Occurrence Lists state'
		);
	}
	state.run();
	getSolverMachine().transition('at_level_zero_state');
};

// ** cdcl transition **

const buildConflictAnalysisTransition = () => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN,
		TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Build Conflict Analysis state'
		);
	}
	state.run();
	getSolverMachine().transition('asserting_clause_state');
};

const assertingClauseInConflictAnalysis = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_ASSERTING_CLAUSE_FUN,
		TWATCH_ASSERTING_CLAUSE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Asserting clause transition',
			'There should be a function in the Asserting Clause state'
		);
	}
	const isAsserting: boolean = state.run();
	if (isAsserting) getSolverMachine().transition('learn_cc_state');
	else getSolverMachine().transition('virtual_resolution_state');
	return isAsserting;
};

const virtualResolutionTransition = () => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_VIRTUAL_RESOLUTION_FUN,
		TWATCH_VIRTUAL_RESOLUTION_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Pick Last Assignment state');
	}
	const virtualResolution: VirtualResolution = state.run();
	getSolverMachine().transition('asserting_clause_state');
	return virtualResolution;
};

const learnConflictClauseTransition = (): CRef => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
		TWATCH_LEARN_CONFLICT_CLAUSE_INPUT
	>;
	if (state.run === undefined) {
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
	state.run(resolvent);
	getSolverMachine().transition('second_highest_dl_state');
	return resolvent.getCRef();
};

const getSecondHighestDLTransition = (cRef: CRef) => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_SECOND_HIGHEST_DL_FUN,
		TWATCH_SECOND_HIGHEST_DL_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}

	const clause: Clause = getClausePool().at(cRef);
	const sndHighestDL: number = state.run(clause);
	getSolverMachine().transition('undo_backjumping_state');
	return sndHighestDL;
};

const backjumpingTransition = (trail: Trail, sndHighestDL: number): Trail => {
	// This transition modifies the sent trail to
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_BACKJUMPING_FUN,
		TWATCH_BACKJUMPING_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	const bjTrail: Trail = state.run(trail, sndHighestDL);
	increaseNoConflicts();
	getSolverMachine().transition('push_trail_state');
	return bjTrail;
};

const pushTrailTransition = (trail: Trail): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_PUSH_TRAIL_FUN,
		TWATCH_PUSH_TRAIL_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Variable In CC state');
	}
	state.run(trail);

	getSolverMachine().transition('unit_propagation_state');
};
