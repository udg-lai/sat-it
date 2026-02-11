import { backjumping as backjumpingAlg } from '$lib/algorithms/backjumping.ts';
import Clause from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { ConflictAnalysis, type VirtualResolution } from '$lib/entities/ConflictAnalysis.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { EWC } from '$lib/entities/Problem.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import type { Watch } from '$lib/entities/WatchTable.svelte.ts';
import {
	atLevelZero,
	obtainCRefFromEWC,
	allAssigned as solverAllAssigned,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	unitPropagation as solverUnitPropagation,
	unaryEmptyClauseDetection
} from '$lib/solvers/shared.svelte.ts';
import { getConflictAnalysis, setConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import {
	getClausePool,
	getCurrentWatch,
	getOccurrenceListQueue,
	getOccurrencesTableMapping,
	getVariablePool,
	getWatchesQueue,
	getWatchTableMapping,
	wipeOccurrences
} from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, stackTrail } from '$lib/states/trails.svelte.ts';
import { fromLeft, isLeft } from '$lib/types/either.ts';
import {
	fromJust,
	isJust,
	isNothing,
	makeJust,
	makeNothing,
	type Maybe
} from '$lib/types/maybe.ts';
import { Lit, type CRef, type List } from '$lib/types/types.ts';

// ** state inputs **

export type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT = 'queue_occurrences_state';

export type TWATCH_CHECK_PENDING_OCCURRENCES_INPUT =
	| 'all_variables_assigned_state'
	| 'traversed_current_occurrences_state';

export type TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT = 'queue_occurrences_state';

export type TWATCH_QUEUE_OCCURRENCES_INPUT =
	| 'complementary_watched_occurrences_retrieve_state'
	| 'queue_watched_occurrences_state';

export type TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT = 'are_remaining_occurrences_state';

export type TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT =
	| 'next_clause_state'
	| 'dequeue_current_occurrences_state';

export type TWATCH_NEXT_OCCURRENCE_INPUT = 'watch_at_first_position_state';

export type TWATCH_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type TWATCH_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_retrieve_state';

export type TWATCH_AT_LEVEL_ZERO_INPUT = 'build_conflict_analysis_state' | 'unsat_state';

export type TWATCH_DECIDE_INPUT = 'complementary_occurrences_retrieve_state';

export type TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT = 'at_level_zero_state';

export type TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT = 'asserting_clause_state';

export type TWATCH_ASSERTING_CLAUSE_INPUT = 'learn_cc_state' | 'virtual_resolution_state';

export type TWATCH_VIRTUAL_RESOLUTION_INPUT = 'asserting_clause_state';

export type TWATCH_LEARN_CONFLICT_CLAUSE_INPUT = 'second_highest_dl_state';

export type TWATCH_SECOND_HIGHEST_DL_INPUT = 'undo_backjumping_state';

export type TWATCH_BACKJUMPING_INPUT = 'push_trail_state';

export type TWATCH_PUSH_TRAIL_INPUT = 'unit_propagation_state';

export type TWATCH_PROPAGATE_CC_INPUT = 'complementary_occurrences_retrieve_state';

// New 2watch Inputs

export type TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT =
	'queue_watched_occurrences_state';

export type TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT =
	| 'are_remaining_occurrences_state'
	| 'traversed_current_occurrences_state';

export type TWATCH_WATCH_AT_FIRST_POSITION_INPUT =
	| 'swap_watches_state'
	| 'first_literal_satisfied_state';

export type TWATCH_SWAP_WATCHES_INPUT = 'first_literal_satisfied_state';

export type TWATCH_FIRST_LITERAL_SATISFIED_INPUT =
	| 'traversed_current_occurrences_state'
	| 'look_non_falsified_literal_state';

export type TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT = 'non_falsified_literal_found_state';

export type TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT =
	| 'delete_watch_state'
	| 'first_literal_falsified_state';

export type TWATCH_DELETE_WATCH_INPUT = 'swap_second_k_literal_position_state';

export type TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT = 'add_watch_state';

export type TWATCH_ADD_WATCH_INPUT = 'traversed_current_occurrences_state';

export type TWATCH_FIRST_LITERAL_FALSIFIED_INPUT =
	| 'wipe_occurrences_queue_state'
	| 'unit_propagation_state';

export type TWATCH_INPUT =
	| TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
	| TWATCH_ALL_VARIABLES_ASSIGNED_INPUT
	| TWATCH_QUEUE_OCCURRENCES_INPUT
	| TWATCH_DEQUEUE_CURRENT_OCCURRENCES_INPUT
	| TWATCH_TRAVERSED_CURRENT_OCCURRENCES_INPUT
	| TWATCH_NEXT_OCCURRENCE_INPUT
	| TWATCH_CHECK_PENDING_OCCURRENCES_INPUT
	| TWATCH_UNIT_PROPAGATION_INPUT
	| TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_INPUT
	| TWATCH_AT_LEVEL_ZERO_INPUT
	| TWATCH_DECIDE_INPUT
	| TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT
	| TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT
	| TWATCH_ASSERTING_CLAUSE_INPUT
	| TWATCH_VIRTUAL_RESOLUTION_INPUT
	| TWATCH_LEARN_CONFLICT_CLAUSE_INPUT
	| TWATCH_SECOND_HIGHEST_DL_INPUT
	| TWATCH_BACKJUMPING_INPUT
	| TWATCH_PUSH_TRAIL_INPUT
	| TWATCH_PROPAGATE_CC_INPUT
	| TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_INPUT
	| TWATCH_QUEUE_WATCHED_OCCURRENCES_INPUT
	| TWATCH_WATCH_AT_FIRST_POSITION_INPUT
	| TWATCH_SWAP_WATCHES_INPUT
	| TWATCH_FIRST_LITERAL_SATISFIED_INPUT
	| TWATCH_LOOK_NON_FALSIFIED_LITERAL_INPUT
	| TWATCH_NON_FALSIFIED_LITERAL_FOUND_INPUT
	| TWATCH_SWAP_SECOND_K_LITERAL_POSITION_INPUT
	| TWATCH_FIRST_LITERAL_FALSIFIED_INPUT
	| TWATCH_DELETE_WATCH_INPUT
	| TWATCH_ADD_WATCH_INPUT;

// ** state functions **

export type TWATCH_DECIDE_FUN = () => Lit;

export const decide: TWATCH_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	const decision: Lit = solverDecide(pool, 'cdcl');
	return decision;
};

export type TWATCH_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allVariablesAssigned: TWATCH_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type TWATCH_QUEUE_OCCURRENCES_FUN = (occurrenceList: OccurrenceList<CRef>) => void;

export const queueOccurrences: TWATCH_QUEUE_OCCURRENCES_FUN = (
	occurrenceList: OccurrenceList<CRef>
) => {
	getOccurrenceListQueue().enqueue(occurrenceList);
};

export type TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN = () => void;

export const dequeueCurrentOccurrences: TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN = () => {
	//Both queues need to be updated
	getWatchesQueue().dequeue();
	getOccurrenceListQueue().dequeue();
};

export type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => Set<CRef>;

export const unaryEmptyClausesDetection: TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = getClausePool();
	return unaryEmptyClauseDetection(pool);
};

export type TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN = (
	occurrenceList: OccurrenceList<EWC>
) => boolean;

export const traversedCurrentOccurrences: TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN = (
	occurrenceList: OccurrenceList<EWC>
) => {
	return occurrenceList.traversed();
};

export type TWATCH_NEXT_OCCURRENCE_FUN = () => EWC;

export const nextClause: TWATCH_NEXT_OCCURRENCE_FUN = () => {
	const occurrences: OccurrenceList<EWC> = getCurrentWatch();
	if (occurrences.isEmpty()) {
		logFatal('A non empty set was expected');
	}
	return occurrences.next();
};

export type TWATCH_CHECK_PENDING_OCCURRENCES_FUN = () => boolean;

export const pendingOccurrences: TWATCH_CHECK_PENDING_OCCURRENCES_FUN = () => {
	return !getWatchesQueue().isEmpty();
};

export type TWATCH_UNIT_PROPAGATION_FUN = (cRef: CRef, reason: 'up' | 'backjumping') => number;

export const unitPropagation: TWATCH_UNIT_PROPAGATION_FUN = (
	cRef: CRef,
	reason: 'up' | 'backjumping'
) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, cRef, reason);
};

export type TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN = (
	assignment: Lit
) => {
	const mapping: Map<Lit, Set<CRef>> = getOccurrencesTableMapping();
	return solverComplementaryOccurrences(mapping, assignment);
};

export type TWATCH_AT_LEVEL_ZERO_FUN = () => boolean;

export const atLevelZeroFun: TWATCH_AT_LEVEL_ZERO_FUN = () => {
	return atLevelZero();
};

export type TWATCH_WIPE_OCCURRENCE_QUEUE_FUN = () => void;

export const wipeOccurrenceQueue: TWATCH_WIPE_OCCURRENCE_QUEUE_FUN = () => {
	// Drop all the occurrences lists inside the solver's queue
	wipeOccurrences();
};

export type TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = () => void;

export const buildConflictAnalysis: TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN = () => {
	// Firstly the last trail is achieved
	const trail: Trail = getLatestTrail();
	if (trail.getDL() < 1) {
		logFatal(
			'Build conflict analysis',
			'Conflict analysis can only be done at decision levels higher than 0'
		);
	}

	// Change the state of the trail to conflict
	trail.setState('conflict');

	// Get last decision level and propagated literals.
	const propagations: VariableAssignment[] = trail.getPropagationsAtLevel(trail.getDL());
	const ld: VariableAssignment = trail.lastDecision();

	// Thirdly the conflict clause is retrieved
	const cRef: CRef | undefined = trail.getConflictiveClause()?.getCRef();
	if (cRef === undefined) {
		logFatal(
			'Conflict analysis',
			'It is not possible to do the CA if no conflicts have been found'
		);
	}

	const cc: Clause = getClausePool().at(cRef).copy();
	const conflictAnalysis: ConflictAnalysis = new ConflictAnalysis(cc, ld, propagations);
	setConflictAnalysis(conflictAnalysis);
};

export type TWATCH_ASSERTING_CLAUSE_FUN = () => boolean;

export const assertingClause: TWATCH_ASSERTING_CLAUSE_FUN = () => {
	// Checks if the clause of the conflict analysis is assertive
	return getConflictAnalysis().hasAssertiveClause();
};

export type TWATCH_VIRTUAL_RESOLUTION_FUN = () => VirtualResolution;

export const virtualResolution: TWATCH_VIRTUAL_RESOLUTION_FUN = () => {
	return getConflictAnalysis().virtualResolution();
};

export type TWATCH_LEARN_CONFLICT_CLAUSE_FUN = (lemma: Clause) => number;

export const learnConflictClause: TWATCH_LEARN_CONFLICT_CLAUSE_FUN = (lemma: Clause) => {
	//Set the lemma as learnt. This will be the clause that will be added to the pool.
	lemma.setAsLemma();

	//The lemma is stored inside the pool
	const cRef: CRef = getClausePool().addClause(lemma);

	// Saves the learnt clause in the trail
	getLatestTrail().attachLemma(lemma);

	console.info(`New clause learned - cRef ${cRef} added to the clause pool`);

	return cRef;
};

export type TWATCH_SECOND_HIGHEST_DL_FUN = (lemma: Clause) => number;

export const sndHighestDL: TWATCH_SECOND_HIGHEST_DL_FUN = (lemma: Clause) => {
	const variables: number[] = lemma.getLiterals().map((literal) => {
		return literal.getVariable().toInt();
	});

	if (variables.length < 1) logFatal('sndHighestDL', 'Dealing with an empty clause');
	if (variables.length == 1)
		return 0; // This is a special case because
	else {
		const dLevels: List<number> = variables.map((variable) =>
			getLatestTrail().getVariableDL(variable)
		);
		const uniqueDLs: Set<number> = new Set(dLevels);
		if (uniqueDLs.size < 2)
			logFatal(
				'sndHighestDL',
				'After applying unique values of DL, there are less than 2 different DL'
			);
		const sortedDLs: List<number> = [...uniqueDLs].sort((a, b) => b - a); // Sort from greater to minor
		return sortedDLs[1];
	}
};

export type TWATCH_BACKJUMPING_FUN = (trail: Trail, decisionLevel: number) => Trail;

export const backjumping: TWATCH_BACKJUMPING_FUN = (trail: Trail, dl: number) => {
	return backjumpingAlg(getVariablePool(), trail, dl);
};

export type TWATCH_PUSH_TRAIL_FUN = (trail: Trail) => void;

export const pushTrail: TWATCH_PUSH_TRAIL_FUN = (trail: Trail) => {
	stackTrail(trail);
};

export type TWATCH_PROPAGATE_CC_FUN = (cRef: CRef) => Lit;

export const propagateCC: TWATCH_PROPAGATE_CC_FUN = (cRef: CRef) => {
	const variables: VariablePool = getVariablePool();
	const clauses: ClausePool = getClausePool();
	return solverUnitPropagation(variables, clauses, cRef, 'backjumping');
};

// ** additional 2watch functions

export type TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN = (assignment: Lit) => Set<Watch>;

export const complementaryWatchedOccurrences: TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN =
	(assignment) => {
		const complementary: Lit = Literal.complementary(assignment);
		// For the moment this will be done like this... I don't know if a special "occurrence List for watches should be created"
		const watches: Watch[] = getWatchTableMapping().retrieveWatchesFromLiteral(complementary);
		return new Set<Watch>(watches);
	};

export type TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN = (watches: OccurrenceList<EWC>) => void;

export const queueWatchedOccurrences: TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN = (
	watches: OccurrenceList<EWC>
) => {
	getWatchesQueue().enqueue(watches);
};

export type TWATCH_WATCH_AT_FIRST_POSITION_FUN = (watch: EWC) => boolean;

export const watchAtFirstPosition: TWATCH_WATCH_AT_FIRST_POSITION_FUN = (watch: EWC) => {
	const cRef: CRef = obtainCRefFromEWC(watch);
	const cLits: Literal[] = getClausePool().at(cRef).getLiterals();
	const currentWatch: OccurrenceList<EWC> = getCurrentWatch();

	// WATCH OUT: This condition is necessary. Empty clauses and unary clauses may also go through this state
	// 	as at the beginning unary and empty clauses are retrieved.
	if (!isJust(currentWatch.getLiteral())) {
		return false;
	} else {
		return cLits[0].toInt() === fromJust(currentWatch.getLiteral());
	}
};

export type TWATCH_SWAP_WATCHES_FUN = (watch: EWC) => void;

export const swapWatches: TWATCH_SWAP_WATCHES_FUN = (watch: EWC) => {
	const cRef: CRef = obtainCRefFromEWC(watch);
	const clause: Clause = getClausePool().at(cRef);
	if (clause.size() < 2) {
		logFatal('Swap issue', 'The clause you are trying to swap positions has less than 2 literals');
	} else {
		clause.swapLiteralPositions(0, 1);
	}
};

export type TWATCH_FIRST_LITERAL_SATISFIED_FUN = (watch: EWC) => boolean;

export const firstLiteralSatisfied: TWATCH_FIRST_LITERAL_SATISFIED_FUN = (watch: EWC) => {
	const cRef: CRef = obtainCRefFromEWC(watch);
	const clause: Clause = getClausePool().at(cRef);

	// This can happen if an empty clause reach this state which is not technically wrong
	if (clause.size() < 1) {
		return false;
	} else {
		return clause.getLiterals()[0].isTrue();
	}
};

// It returns the positions where a non falsified literal is found
export type TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN = (watch: EWC) => Maybe<number>;

export const lookNonFalsifiedLiteral: TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN = (watch: EWC) => {
	const cRef: CRef = obtainCRefFromEWC(watch);
	const candidates: Literal[] = getClausePool().at(cRef).getLiterals();

	let i = 2;
	let selectedCandidate: Maybe<number> = makeNothing();
	while (i < candidates.length && isNothing(selectedCandidate)) {
		if (!candidates[i].isFalse()) {
			selectedCandidate = makeJust(i);
		}
		i++;
	}
	return selectedCandidate;
};

export type TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN = (candidate: Maybe<number>) => boolean;

export const nonFalsifiedLiteralFound: TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN = (
	candidate: Maybe<number>
) => {
	return isJust(candidate);
};

export type TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN = (
	candidate: Maybe<number>,
	watch: EWC
) => void;

export const swapSecondKLiteralPos: TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN = (
	candidate: Maybe<number>,
	watch: EWC
) => {
	if (!isLeft(watch)) {
		logFatal('A watch type should be inside the ewc watch');
	}
	const currentWatch: Watch = fromLeft(watch);

	if (isNothing(candidate)) {
		logFatal('Swapping issue', 'There is no candidate');
	}
	const clause: Clause = getClausePool().at(currentWatch.cRef);
	const pos: number = fromJust(candidate);

	if (clause.size() < pos) {
		logFatal('Swap issue', 'The candidate access an out of bound positions from the clause');
	} else {
		clause.swapLiteralPositions(1, pos);
	}
};

export type TWATCH_FIRST_LITERAL_FALSIFIED_FUN = (watch: EWC) => boolean;

export const firstLiteralFalsified: TWATCH_FIRST_LITERAL_FALSIFIED_FUN = (watch: EWC) => {
	const cRef: CRef = obtainCRefFromEWC(watch);
	const clause: Clause = getClausePool().at(cRef);
	if (clause.size() < 1) {
		return true;
	} else {
		return clause.getLiterals()[0].isFalse();
	}
};

export type TWATCH_DELETE_WATCH_FUN = (watch: EWC) => void;

// In this function, always the 2nd literal will be the one whose watch will be removed
export const deleteWatch: TWATCH_DELETE_WATCH_FUN = (watch: EWC) => {
	if (!isLeft(watch)) {
		logFatal('Delete watch error', 'It is only possible to delete a watch if you have a watch');
	}
	const cRef: CRef = obtainCRefFromEWC(watch);
	const secondLiteral: Literal = getClausePool().at(cRef).getLiterals()[1];
	getWatchTableMapping().deleteWatch(secondLiteral.toInt(), fromLeft(watch));
};

export type TWATCH_ADD_WATCH_FUN = (watch: EWC) => void;

// In this function, always the 2nd literal will be the one whose watch will be added
export const addWatch: TWATCH_ADD_WATCH_FUN = (watch: EWC) => {
	if (!isLeft(watch)) {
		logFatal('Add watch error', 'It is only possible to add a watch if you have a watch');
	}
	const cRef: CRef = obtainCRefFromEWC(watch);
	const secondLiteral: Literal = getClausePool().at(cRef).getLiterals()[1];
	getWatchTableMapping().addWatch(secondLiteral.toInt(), fromLeft(watch));
};

export type TWATCH_FUN =
	| TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN
	| TWATCH_CHECK_PENDING_OCCURRENCES_FUN
	| TWATCH_ALL_VARIABLES_ASSIGNED_FUN
	| TWATCH_QUEUE_OCCURRENCES_FUN
	| TWATCH_DEQUEUE_CURRENT_OCCURRENCES_FUN
	| TWATCH_UNIT_PROPAGATION_FUN
	| TWATCH_COMPLEMENTARY_OCCURRENCES_RETRIEVE_FUN
	| TWATCH_AT_LEVEL_ZERO_FUN
	| TWATCH_NEXT_OCCURRENCE_FUN
	| TWATCH_DECIDE_FUN
	| TWATCH_WIPE_OCCURRENCE_QUEUE_FUN
	| TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_FUN
	| TWATCH_ASSERTING_CLAUSE_FUN
	| TWATCH_VIRTUAL_RESOLUTION_FUN
	| TWATCH_LEARN_CONFLICT_CLAUSE_FUN
	| TWATCH_SECOND_HIGHEST_DL_FUN
	| TWATCH_BACKJUMPING_FUN
	| TWATCH_PUSH_TRAIL_FUN
	| TWATCH_TRAVERSED_CURRENT_OCCURRENCES_FUN
	| TWATCH_COMPLEMENTARY_WATCHED_OCCURRENCES_RETRIEVE_FUN
	| TWATCH_QUEUE_WATCHED_OCCURRENCES_FUN
	| TWATCH_WATCH_AT_FIRST_POSITION_FUN
	| TWATCH_SWAP_WATCHES_FUN
	| TWATCH_FIRST_LITERAL_SATISFIED_FUN
	| TWATCH_LOOK_NON_FALSIFIED_LITERAL_FUN
	| TWATCH_NON_FALSIFIED_LITERAL_FOUND_FUN
	| TWATCH_DELETE_WATCH_FUN
	| TWATCH_SWAP_SECOND_K_LITERAL_POSITION_FUN
	| TWATCH_ADD_WATCH_FUN
	| TWATCH_FIRST_LITERAL_FALSIFIED_FUN;
