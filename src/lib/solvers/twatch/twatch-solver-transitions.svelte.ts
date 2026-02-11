import type Clause from '$lib/entities/Clause.svelte.ts';
import type { ConflictAnalysis, VirtualResolution } from '$lib/entities/ConflictAnalysis.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import ClauseList from '$lib/entities/OccurrenceList.svelte.ts';
import type { EWC } from '$lib/entities/Problem.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { Watch } from '$lib/entities/WatchTable.svelte.ts';
import {
	conflictAnalysisFinishedEventBus,
	conflictDetectedEventBus,
	visitingComplementaryOccEventBus
} from '$lib/events/events.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getClausePool, getCurrentWatch, getWatchesQueue } from '$lib/states/problem.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { increaseNoConflicts } from '$lib/states/statistics.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail } from '$lib/states/trails.svelte.ts';
import { fromRight, isLeft, makeLeft, makeRight } from '$lib/types/either.ts';
import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { obtainCRefFromEWC } from '../shared.svelte.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	TWATCH_ADD_WATCH_FUN,
	TWATCH_ADD_WATCH_INPUT,
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
	TWATCH_CHECK_PENDING_OCCURRENCES_FUN,
	TWATCH_CHECK_PENDING_OCCURRENCES_INPUT,
	TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN,
	TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT,
	TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN,
	TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT,
	TWATCH_DECIDE_FUN,
	TWATCH_DECIDE_INPUT,
	TWATCH_DELETE_WATCH_FUN,
	TWATCH_DELETE_WATCH_INPUT,
	TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN,
	TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT,
	TWATCH_FIRST_LITERAL_FALSIFIED_FUN,
	TWATCH_FIRST_LITERAL_FALSIFIED_INPUT,
	TWATCH_FIRST_LITERAL_SATISFIED_FUN,
	TWATCH_FIRST_LITERAL_SATISFIED_INPUT,
	TWATCH_LEARN_CONFLICT_CLAUSE_FUN,
	TWATCH_LEARN_CONFLICT_CLAUSE_INPUT,
	TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN,
	TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT,
	TWATCH_NEXT_OCCURRENCE_FUN,
	TWATCH_NEXT_OCCURRENCE_INPUT,
	TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN,
	TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT,
	TWATCH_PUSH_TRAIL_FUN,
	TWATCH_PUSH_TRAIL_INPUT,
	TWATCH_QUEUE_OCCURRENCES_FUN,
	TWATCH_QUEUE_OCCURRENCES_INPUT,
	TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN,
	TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT,
	TWATCH_SECOND_HIGHEST_DL_FUN,
	TWATCH_SECOND_HIGHEST_DL_INPUT,
	TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN,
	TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT,
	TWATCH_SWAP_WATCHES_FUN,
	TWATCH_SWAP_WATCHES_INPUT,
	TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN,
	TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT,
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN,
	TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT,
	TWATCH_UNIT_PROPAGATION_FUN,
	TWATCH_UNIT_PROPAGATION_INPUT,
	TWATCH_VIRTUAL_RESOLUTION_FUN,
	TWATCH_VIRTUAL_RESOLUTION_INPUT,
	TWATCH_WATCH_AT_FIRST_POSITION_FUN,
	TWATCH_WATCH_AT_FIRST_POSITION_INPUT,
	TWATCH_WIPE_OCCURRENCE_QUEUE_FUN,
	TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
} from './twatch-domain.svelte.ts';

/* exported transitions */

export const initialTransition = (): void => {
	const unaryEmptyCRefs: Set<CRef> = unaryEmptyClausesTransition();
	const regularOccurrences = new ClauseList<CRef>(makeNothing(), [...unaryEmptyCRefs]);
	queueOccurrenceListTransition(regularOccurrences, true);
	const watchedOccurrences = new ClauseList<EWC>(makeNothing(), [
		...Array.from(unaryEmptyCRefs).map(makeRight)
	]);
	queueWatchedOccurrencesTransition(watchedOccurrences);
	afterComplementaryBlock();
};

export const decide = (): void => {
	const assignment: Lit = decideTransition();
	queuesUpdateBlock(assignment);
	afterComplementaryBlock();
};

const queuesUpdateBlock = (assignment: Lit): void => {
	const fullOccurrences: ClauseList<CRef> =
		complementaryOccurrencesDetectionTransition(assignment);
	queueOccurrenceListTransition(fullOccurrences);
	const watchedOccurrences: ClauseList<EWC> = watchedOccurrencesDetectionTransition(assignment);
	queueWatchedOccurrencesTransition(watchedOccurrences);
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
		// This is kinda stupid but (resolvent.asserting -> asserting)
		const cRef: CRef = learnConflictClauseTransition();
		const sndHighestDL: number = getSecondHighestDLTransition(cRef);
		const trailAfterBJ: Trail = backjumpingTransition(getLatestTrail(), sndHighestDL);

		// Push the new trail after backjumping and notify
		pushTrailTransition(trailAfterBJ);

		const propagated: Lit = unitPropagationTransition(cRef, 'backjumping');
		queuesUpdateBlock(propagated);
		afterComplementaryBlock();

		// After the conflict analysis finishes we notify it
		conflictAnalysisFinishedEventBus.emit();
	}
};

/* General non-exported transitions */

const afterComplementaryBlock = (): void => {
	const thereAreOccurrences: boolean = checkPendingOccurrenceListsTransition();
	if (!thereAreOccurrences) {
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
		dequeueCurrentOccurrencesTransition();
		const pendingOcc: boolean = checkPendingOccurrenceListsTransition();
		if (!pendingOcc) {
			allVariablesAssignedTransition();
		}
	} else {
		const watch: EWC = nextOccurrenceTransition();
		if (watchAtFirstPositionTransition(watch)) {
			swapWatchesTransition(watch);
		}
		if (!firstLiteralSatisfiedTransition(watch)) {
			const literalPos: Maybe<number> = lookNonFalsifiedLiteralTransition(watch);
			if (nonFalsifiedLiteralFoundTransition(literalPos)) {
				deleteWatchTransition(watch);
				swapSecondKLiteralPosTransition(literalPos, watch);
				addWatchTransition(watch);
			} else {
				const cRef: CRef = obtainCRefFromEWC(watch);
				if (!firstLiteralFalsifiedTransition(watch)) {
					const propagated: Lit = unitPropagationTransition(cRef, 'up');
					queuesUpdateBlock(propagated);
				} else {
					getLatestTrail().attachConflictiveClause(getClausePool().at(cRef));
					conflictDetectedEventBus.emit();
				}
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
	const unaryEmptyRefs: Set<CRef> = state.run();
	getSolverMachine().transition('queue_occurrences_state');
	return unaryEmptyRefs;
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

const queueOccurrenceListTransition = (
	occurrenceList: ClauseList<CRef>,
	fromEmptyUnary: boolean = false
): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_QUEUE_OCCURRENCES_FUN,
		TWATCH_QUEUE_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Queue Occurrence List state'
		);
	}
	state.run(occurrenceList);
	if (fromEmptyUnary) getSolverMachine().transition('queue_watched_occurrences_state');
	else getSolverMachine().transition('complementary_watched_occurrences_retrieve_state');
};

const checkPendingOccurrenceListsTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_CHECK_PENDING_OCCURRENCES_FUN,
		TWATCH_CHECK_PENDING_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'Function to check if there are pending occurrences is missing'
		);
	}
	const pendingOcc: boolean = state.run();
	if (pendingOcc) getSolverMachine().transition('traversed_current_occurrences_state');
	else getSolverMachine().transition('all_variables_assigned_state');
	return pendingOcc;
};

const traversedOccurrenceListTransition = (): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN,
		TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'A function that validates all occurrences checked is needed');
	}
	const occurrences: ClauseList<EWC> = getCurrentWatch();
	const traversed: boolean = state.run(occurrences);
	if (traversed) getSolverMachine().transition('dequeue_current_occurrences_state');
	else getSolverMachine().transition('next_clause_state');
	return traversed;
};

const nextOccurrenceTransition = (): EWC => {
	// Takes from the `head` of the occurrencesQueue the set of clauses to be checked
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_NEXT_OCCURRENCE_FUN,
		TWATCH_NEXT_OCCURRENCE_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Next Clause state');
	}
	// Returns the next clause to be checked from the occurrence list at the head of the queue
	const watch: EWC = state.run();
	getSolverMachine().transition('watch_at_first_position_state');
	return watch;
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

const dequeueCurrentOccurrencesTransition = (): void => {
	// This transition removes the first Occurrence List from the occurrencesQueue.
	// Of the CDCL_SolverMachine.
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN,
		TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT
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
	getSolverMachine().transition('complementary_occurrences_retrieve_state');
	return propagated;
};

const complementaryOccurrencesDetectionTransition = (assignment: Lit): ClauseList<CRef> => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN,
		TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: Set<CRef> = state.run(assignment);
	getSolverMachine().transition('queue_occurrences_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new ClauseList<CRef>(makeJust(complementary), [...clauses]);
};

const watchedOccurrencesDetectionTransition = (assignment: Lit): ClauseList<EWC> => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN,
		TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const watches: Set<Watch> = state.run(assignment);
	getSolverMachine().transition('queue_watched_occurrences_state');
	const complementary: Lit = Literal.complementary(assignment);
	return new ClauseList<EWC>(makeJust(complementary), [...Array.from(watches).map(makeLeft)]);
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
	getSolverMachine().transition('complementary_occurrences_retrieve_state');
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

const queueWatchedOccurrencesTransition = (occurrences: ClauseList<EWC>): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN,
		TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Variable in the queue watched occurrences state'
		);
	}
	state.run(occurrences);
	const queueSize = getWatchesQueue().size();
	if (queueSize > 1) {
		// This means, we came from UP and complementary occurrence detection
		getSolverMachine().transition('traversed_current_occurrences_state');
	} else if (queueSize === 1) {
		// This means we came from initial UPs or decide transitions
		getSolverMachine().transition('are_remaining_occurrences_state');
	} else {
		logFatal('2WATCH Solver Transition Error', "Watched Occurrences Queue shouldn't be empty here");
	}
};

const watchAtFirstPositionTransition = (watch: EWC): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_WATCH_AT_FIRST_POSITION_FUN,
		TWATCH_WATCH_AT_FIRST_POSITION_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Watch at first position state'
		);
	}
	const watchAtFirstPosition: boolean = state.run(watch);
	if (watchAtFirstPosition) getSolverMachine().transition('swap_watches_state');
	else getSolverMachine().transition('first_literal_satisfied_state');
	return watchAtFirstPosition;
};

const swapWatchesTransition = (watch: EWC): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_SWAP_WATCHES_FUN,
		TWATCH_SWAP_WATCHES_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in swap watches state');
	}
	state.run(watch);
	getSolverMachine().transition('first_literal_satisfied_state');
};

const firstLiteralSatisfiedTransition = (watch: EWC): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_FIRST_LITERAL_SATISFIED_FUN,
		TWATCH_FIRST_LITERAL_SATISFIED_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in First literal satisfied state');
	}
	const firstLiteralSatisfied: boolean = state.run(watch);
	if (firstLiteralSatisfied) getSolverMachine().transition('traversed_current_occurrences_state');
	else getSolverMachine().transition('look_non_falsified_literal_state');
	return firstLiteralSatisfied;
};

const lookNonFalsifiedLiteralTransition = (watch: EWC): Maybe<number> => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN,
		TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in Look up non falsified literal state'
		);
	}
	const literalPos: Maybe<number> = state.run(watch);
	getSolverMachine().transition('non_falsified_literal_found_state');
	return literalPos;
};

const nonFalsifiedLiteralFoundTransition = (litPos: Maybe<number>): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN,
		TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in Non falsified literal found state'
		);
	}
	const posFound: boolean = state.run(litPos);
	if (posFound) getSolverMachine().transition('delete_watch_state');
	else getSolverMachine().transition('first_literal_falsified_state');
	return posFound;
};

const deleteWatchTransition = (watch: EWC): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_DELETE_WATCH_FUN,
		TWATCH_DELETE_WATCH_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in delete watch state');
	}
	state.run(watch);
	getSolverMachine().transition('swap_second_k_literal_position_state');
};

const swapSecondKLiteralPosTransition = (litPos: Maybe<number>, watch: EWC): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN,
		TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in swap second k literal pos state'
		);
	}
	state.run(litPos, watch);
	getSolverMachine().transition('add_watch_state');
};

const addWatchTransition = (watch: EWC): void => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_ADD_WATCH_FUN,
		TWATCH_ADD_WATCH_INPUT
	>;
	if (state.run === undefined) {
		logFatal('Function call error', 'There should be a function in add watch state');
	}
	state.run(watch);
	getSolverMachine().transition('traversed_current_occurrences_state');
};

const firstLiteralFalsifiedTransition = (watch: EWC): boolean => {
	const state = getSolverMachine().getActiveState() as NonFinalState<
		TWATCH_FIRST_LITERAL_FALSIFIED_FUN,
		TWATCH_FIRST_LITERAL_FALSIFIED_INPUT
	>;
	if (state.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in Look up non falsified literal state'
		);
	}
	const firstLiteralFalsified: boolean = state.run(watch);
	if (firstLiteralFalsified) getSolverMachine().transition('wipe_occurrences_queue_state');
	else getSolverMachine().transition('unit_propagation_state');
	return firstLiteralFalsified;
};
