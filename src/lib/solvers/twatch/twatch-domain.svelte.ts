import { backjumping as backjumpingAlg } from '$lib/algorithms/backjumping.ts';
import Clause, {
	isUnitEval,
	isUnsatisfiedEval,
	type ClauseEval
} from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { ConflictAnalysis, type VirtualResolution } from '$lib/entities/ConflictAnalysis.svelte.ts';
import OccurrenceList from '$lib/entities/OccurrenceList.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import {
	atLevelZero,
	clauseEvaluation,
	allAssigned as solverAllAssigned,
	complementaryOccurrences as solverComplementaryOccurrences,
	decide as solverDecide,
	unaryEmptyClauseDetection as solverUnitClauseDetection,
	unitPropagation as solverUnitPropagation
} from '$lib/solvers/shared.svelte.ts';
import { getConflictAnalysis, setConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import {
	getClausePool,
	getCurrentOccurrences,
	getOccurrenceListQueue,
	getOccurrencesTableMapping,
	getProblemStore,
	getVariablePool,
	wipeOccurrences
} from '$lib/states/problem.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, stackTrail } from '$lib/states/trails.svelte.ts';
import type { CRef, List, Lit } from '$lib/types/types.ts';

// ** state inputs **

export type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT = 'queue_occurrence_list_state';

export type TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT =
	| 'all_variables_assigned_state'
	| 'traversed_occurrences_state';

export type TWATCH_QUEUE_OCCURRENCE_LIST_INPUT =
	| 'are_remaining_occurrences_state'
	| 'traversed_occurrences_state';

export type TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT = 'are_remaining_occurrences_state';

export type TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT =
	| 'next_clause_state'
	| 'dequeue_occurrence_list_state';

export type TWATCH_NEXT_OCCURRENCE_INPUT = 'falsified_clause_state';

export type TWATCH_CONFLICT_DETECTION_INPUT = 'unit_clause_state' | 'wipe_occurrences_queue_state';

export type TWATCH_UNIT_CLAUSE_INPUT = 'traversed_occurrences_state' | 'unit_propagation_state';

export type TWATCH_ALL_VARIABLES_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type TWATCH_UNIT_PROPAGATION_INPUT = 'complementary_occurrences_state';

export type TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT = 'queue_occurrence_list_state';

export type TWATCH_AT_LEVEL_ZERO_INPUT = 'build_conflict_analysis_state' | 'unsat_state';

export type TWATCH_DECIDE_INPUT = 'complementary_occurrences_state';

export type TWATCH_WIPE_OCCURRENCE_QUEUE_INPUT = 'at_level_zero_state';

//New CDCL Inputs

export type TWATCH_BUILD_CONFLICT_ANALYSIS_STRUCTURE_INPUT = 'asserting_clause_state';

export type TWATCH_ASSERTING_CLAUSE_INPUT = 'learn_cc_state' | 'virtual_resolution_state';

export type TWATCH_VIRTUAL_RESOLUTION_INPUT = 'asserting_clause_state';

export type TWATCH_LEARN_CONFLICT_CLAUSE_INPUT = 'second_highest_dl_state';

export type TWATCH_SECOND_HIGHEST_DL_INPUT = 'undo_backjumping_state';

export type TWATCH_BACKJUMPING_INPUT = 'push_trail_state';

export type TWATCH_PUSH_TRAIL_INPUT = 'unit_propagation_state';

export type TWATCH_PROPAGATE_CC_INPUT = 'complementary_occurrences_state';

export type TWATCH_INPUT =
	| TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_INPUT
	| TWATCH_ALL_VARIABLES_ASSIGNED_INPUT
	| TWATCH_QUEUE_OCCURRENCE_LIST_INPUT
	| TWATCH_UNSTACK_OCCURRENCE_LIST_INPUT
	| TWATCH_TRAVERSED_OCCURRENCE_LIST_INPUT
	| TWATCH_NEXT_OCCURRENCE_INPUT
	| TWATCH_CONFLICT_DETECTION_INPUT
	| TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_INPUT
	| TWATCH_UNIT_CLAUSE_INPUT
	| TWATCH_UNIT_PROPAGATION_INPUT
	| TWATCH_COMPLEMENTARY_OCCURRENCES_INPUT
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
	| TWATCH_PROPAGATE_CC_INPUT;

// ** state functions **

export type TWATCH_DECIDE_FUN = () => Lit;

export const decide: TWATCH_DECIDE_FUN = () => {
	const pool: VariablePool = getVariablePool();
	const decision: Lit = solverDecide(pool, 'cdcl');
	return decision;
};

export type TWATCH_ALL_VARIABLES_ASSIGNED_FUN = () => boolean;

export const allAssigned: TWATCH_ALL_VARIABLES_ASSIGNED_FUN = () => {
	const pool = getVariablePool();
	return solverAllAssigned(pool);
};

export type TWATCH_QUEUE_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => void;

export const queueOccurrenceList: TWATCH_QUEUE_OCCURRENCE_LIST_FUN = (
	occurrenceList: OccurrenceList
) => {
	getOccurrenceListQueue().enqueue(occurrenceList);
};

export type TWATCH_UNSTACK_OCCURRENCE_LIST_FUN = () => void;

export const dequeueOccurrenceList: TWATCH_UNSTACK_OCCURRENCE_LIST_FUN = () => {
	getOccurrenceListQueue().dequeue();
};

export type TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => Set<CRef>;

export const unaryEmptyClausesDetection: TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN = () => {
	const pool: ClausePool = getClausePool();
	return solverUnitClauseDetection(pool);
};

export type TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN = (occurrenceList: OccurrenceList) => boolean;

export const traversedOccurrenceList: TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN = (
	occurrenceList: OccurrenceList
) => {
	return occurrenceList.traversed();
};

export type TWATCH_NEXT_OCCURRENCE_FUN = () => CRef;

export const nextClause: TWATCH_NEXT_OCCURRENCE_FUN = () => {
	const occurrenceList: OccurrenceList = getCurrentOccurrences();
	if (occurrenceList.isEmpty()) {
		logFatal('A non empty set was expected');
	}
	return occurrenceList.next();
};

export type TWATCH_CONFLICT_DETECTION_FUN = (cRef: CRef) => boolean;

export const unsatisfiedClause: TWATCH_CONFLICT_DETECTION_FUN = (cRef: CRef) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, cRef);
	return isUnsatisfiedEval(evaluation);
};

export type TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN = () => boolean;

export const pendingOccurrenceList: TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN = () => {
	return !getOccurrenceListQueue().isEmpty();
};

export type TWATCH_UNIT_CLAUSE_FUN = (cRef: CRef) => boolean;

export const unitClause: TWATCH_UNIT_CLAUSE_FUN = (cRef: CRef) => {
	const pool: ClausePool = getClausePool();
	const evaluation: ClauseEval = clauseEvaluation(pool, cRef);
	return isUnitEval(evaluation);
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

export type TWATCH_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => Set<CRef>;

export const complementaryOccurrences: TWATCH_COMPLEMENTARY_OCCURRENCES_FUN = (assignment: Lit) => {
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

// ** additional cdcl function **

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
	const cRef: CRef = getProblemStore().addClause(lemma);

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

export type TWATCH_FUN =
	| TWATCH_UNARY_EMPTY_CLAUSES_DETECTION_FUN
	| TWATCH_CHECK_PENDING_OCCURRENCE_LISTS_FUN
	| TWATCH_ALL_VARIABLES_ASSIGNED_FUN
	| TWATCH_QUEUE_OCCURRENCE_LIST_FUN
	| TWATCH_UNSTACK_OCCURRENCE_LIST_FUN
	| TWATCH_CONFLICT_DETECTION_FUN
	| TWATCH_UNIT_CLAUSE_FUN
	| TWATCH_UNIT_PROPAGATION_FUN
	| TWATCH_COMPLEMENTARY_OCCURRENCES_FUN
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
	| TWATCH_TRAVERSED_OCCURRENCE_LIST_FUN;
