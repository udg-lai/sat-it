import { logFatal } from '$lib/store/toasts.ts';
import { updateLastTrailEnding } from '$lib/store/trails.svelte.ts';
import { type NonFinalState } from '../StateMachine.svelte.ts';
import type {
	DPLL_ALL_CLAUSES_CHECKED_FUN,
	DPLL_ALL_CLAUSES_CHECKED_INPUT,
	DPLL_ALL_VARIABLES_ASSIGNED_FUN,
	DPLL_ALL_VARIABLES_ASSIGNED_INPUT,
	DPLL_BACKTRACKING_FUN,
	DPLL_BACKTRACKING_INPUT,
	DPLL_CHECK_NON_DECISION_MADE_FUN,
	DPLL_CHECK_NON_DECISION_MADE_INPUT,
	DPLL_CHECK_PENDING_CLAUSES_FUN,
	DPLL_CHECK_PENDING_CLAUSES_INPUT,
	DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
	DPLL_COMPLEMENTARY_OCCURRENCES_INPUT,
	DPLL_CONFLICT_DETECTION_FUN,
	DPLL_CONFLICT_DETECTION_INPUT,
	DPLL_DECIDE_FUN,
	DPLL_DECIDE_INPUT,
	DPLL_DELETE_CLAUSE_FUN,
	DPLL_DELETE_CLAUSE_INPUT,
	DPLL_EMPTY_CLAUSE_FUN,
	DPLL_EMPTY_CLAUSE_INPUT,
	DPLL_EMPTY_CLAUSE_SET_FUN,
	DPLL_EMPTY_CLAUSE_SET_INPUT,
	DPLL_NEXT_CLAUSE_FUN,
	DPLL_NEXT_CLAUSE_INPUT,
	DPLL_PICK_CLAUSE_SET_FUN,
	DPLL_PICK_CLAUSE_SET_INPUT,
	DPLL_QUEUE_CLAUSE_SET_FUN,
	DPLL_QUEUE_CLAUSE_SET_INPUT,
	DPLL_TRIGGERED_CLAUSES_FUN,
	DPLL_TRIGGERED_CLAUSES_INPUT,
	DPLL_UNIT_CLAUSE_FUN,
	DPLL_UNIT_CLAUSE_INPUT,
	DPLL_UNIT_CLAUSES_DETECTION_FUN,
	DPLL_UNIT_CLAUSES_DETECTION_INPUT,
	DPLL_UNIT_PROPAGATION_FUN,
	DPLL_UNIT_PROPAGATION_INPUT,
	DPLL_UNSTACK_CLAUSE_SET_FUN,
	DPLL_UNSTACK_CLAUSE_SET_INPUT
} from './dpll-domain.svelte.ts';
import type { DPLL_SolverMachine } from './dpll-solver-machine.svelte.ts';
import type { DPLL_StateMachine } from './dpll-state-machine.svelte.ts';
import {
	incrementCheckingIndex,
	updateClausesToCheck
} from '$lib/store/conflict-detection-state.svelte.ts';
import type { ConflictDetection } from '../SolverMachine.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { conflictDetectionEventBus } from '$lib/transversal/events.ts';

export const initialTransition = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	ecTransition(stateMachine);
	if (stateMachine.onFinalState()) return;
	const complementaryClauses: SvelteSet<number> = ucdTransition(stateMachine);
	conflictDetectionBlock(solver, stateMachine, -1, complementaryClauses);
};

const conflictDetectionBlock = (
	solver: DPLL_SolverMachine,
	stateMachine: DPLL_StateMachine,
	variable: number,
	complementaryClauses: SvelteSet<number>
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
	conflictDetectionEventBus.emit();
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

const ecTransition = (stateMachine: DPLL_StateMachine): void => {
	console.log('ecTransition');
	if (stateMachine.getActiveId() !== 0) {
		logFatal(
			'Fail Initial',
			'Trying to use initialTransition in a state that is not the initial one'
		);
	}
	const ecState = stateMachine.getActiveState() as NonFinalState<
		DPLL_EMPTY_CLAUSE_FUN,
		DPLL_EMPTY_CLAUSE_INPUT
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

const ucdTransition = (stateMachine: DPLL_StateMachine): SvelteSet<number> => {
	const ucdState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_CLAUSES_DETECTION_FUN,
		DPLL_UNIT_CLAUSES_DETECTION_INPUT
	>;
	if (ucdState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Unit Clause Detection state'
		);
	}
	const result: SvelteSet<number> = ucdState.run();
	stateMachine.transition('triggered_clauses_state');
	return result;
};

const triggeredClausesTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine,
	complementaryClauses: SvelteSet<number>
): boolean => {
	const triggeredClausesState = stateMachine.getActiveState() as NonFinalState<
		DPLL_TRIGGERED_CLAUSES_FUN,
		DPLL_TRIGGERED_CLAUSES_INPUT
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

const allVariablesAssignedTransition = (stateMachine: DPLL_StateMachine): void => {
	const allVariablesAssignedState = stateMachine.getActiveState() as NonFinalState<
		DPLL_ALL_VARIABLES_ASSIGNED_FUN,
		DPLL_ALL_VARIABLES_ASSIGNED_INPUT
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
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine,
	variable: number,
	clauseSet: SvelteSet<number>
): void => {
	const queueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_QUEUE_CLAUSE_SET_FUN,
		DPLL_QUEUE_CLAUSE_SET_INPUT
	>;
	if (queueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Queue Clause Set state');
	}
	const size: number = queueClauseSetState.run(variable, clauseSet, solver);
	if (size > 1) stateMachine.transition('delete_clause_state');
	else stateMachine.transition('check_pending_clauses_state');
};

const checkPendingClausesSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): boolean => {
	const checkPendingClausesSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CHECK_PENDING_CLAUSES_FUN,
		DPLL_CHECK_PENDING_CLAUSES_INPUT
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
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): SvelteSet<number> => {
	const pickClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_PICK_CLAUSE_SET_FUN,
		DPLL_PICK_CLAUSE_SET_INPUT
	>;
	if (pickClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Peek Clause Set state');
	}
	const result: SvelteSet<number> = pickClauseSetState.run(solver);
	stateMachine.transition('all_clauses_checked_state');
	return result;
};

const allClausesCheckedTransition = (
	stateMachine: DPLL_StateMachine,
	clauses: SvelteSet<number>
): boolean => {
	const allClausesCheckedState = stateMachine.getActiveState() as NonFinalState<
		DPLL_ALL_CLAUSES_CHECKED_FUN,
		DPLL_ALL_CLAUSES_CHECKED_INPUT
	>;
	if (allClausesCheckedState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the All Clausees Checked state');
	}
	const result: boolean = allClausesCheckedState.run(clauses);
	if (result) stateMachine.transition('unstack_clause_set_state');
	else stateMachine.transition('next_clause_state');
	return result;
};

export const analyzeClause = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	const pendingConflict: ConflictDetection = solver.consultPostponed();
	const clauseSet: SvelteSet<number> = pendingConflict.clauses;
	const clauseId: number = nextClauseTransition(stateMachine, clauseSet);
	const conflict: boolean = conflictDetectionTransition(stateMachine, clauseId);
	if (conflict) {
		updateLastTrailEnding(clauseId);
		emptyClauseSetTransition(stateMachine, solver);
		decisionLevelTransition(stateMachine);
		return;
	}
	const unitClause: boolean = unitClauseTransition(stateMachine, clauseId);
	if (unitClause) {
		const literalToPropagate: number = unitPropagationTransition(stateMachine, clauseId);
		const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
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
		updateClausesToCheck(new SvelteSet<number>(), -1);
		allVariablesAssignedTransition(stateMachine);
		return;
	}
	const clausesToCheck = pickClauseSetTransition(stateMachine, solver);
	const allClausesChecked = allClausesCheckedTransition(stateMachine, clausesToCheck);
	if (allClausesChecked) {
		logFatal('This is not a possibility in this case');
	}
};

const nextClauseTransition = (
	stateMachine: DPLL_StateMachine,
	clauseSet: SvelteSet<number>
): number => {
	const nextCluaseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_NEXT_CLAUSE_FUN,
		DPLL_NEXT_CLAUSE_INPUT
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
	stateMachine: DPLL_StateMachine,
	clauseId: number
): boolean => {
	const conflictDetectionState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CONFLICT_DETECTION_FUN,
		DPLL_CONFLICT_DETECTION_INPUT
	>;
	if (conflictDetectionState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Conflict Detection state');
	}
	const result: boolean = conflictDetectionState.run(clauseId);
	if (result) stateMachine.transition('empty_clause_set_state');
	else stateMachine.transition('unit_clause_state');
	return result;
};

const decisionLevelTransition = (stateMachine: DPLL_StateMachine): void => {
	const decisionLevelState = stateMachine.getActiveState() as NonFinalState<
		DPLL_CHECK_NON_DECISION_MADE_FUN,
		DPLL_CHECK_NON_DECISION_MADE_INPUT
	>;
	if (decisionLevelState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decision Level state');
	}
	const result: boolean = decisionLevelState.run();
	if (result) stateMachine.transition('unsat_state');
	else stateMachine.transition('backtracking_state');
};

const unitClauseTransition = (stateMachine: DPLL_StateMachine, clauseId: number): boolean => {
	const unitClauseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_CLAUSE_FUN,
		DPLL_UNIT_CLAUSE_INPUT
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
	stateMachine: DPLL_StateMachine,
	clauseSet: SvelteSet<number>,
	clauseId: number
): void => {
	const deleteClauseState = stateMachine.getActiveState() as NonFinalState<
		DPLL_DELETE_CLAUSE_FUN,
		DPLL_DELETE_CLAUSE_INPUT
	>;
	if (deleteClauseState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Delete Clause state');
	}
	deleteClauseState.run(clauseSet, clauseId);
	stateMachine.transition('all_clauses_checked_state');
};

const unstackClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): void => {
	const dequeueClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNSTACK_CLAUSE_SET_FUN,
		DPLL_UNSTACK_CLAUSE_SET_INPUT
	>;
	if (dequeueClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Dequeue Clause Set state');
	}
	dequeueClauseSetState.run(solver);
	stateMachine.transition('check_pending_clauses_state');
};

const unitPropagationTransition = (stateMachine: DPLL_StateMachine, clauseId: number): number => {
	const unitPropagationState = stateMachine.getActiveState() as NonFinalState<
		DPLL_UNIT_PROPAGATION_FUN,
		DPLL_UNIT_PROPAGATION_INPUT
	>;
	if (unitPropagationState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Unit Propagation state');
	}
	const literalToPropagate: number = unitPropagationState.run(clauseId);
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const complementaryOccurrencesTransition = (
	stateMachine: DPLL_StateMachine,
	literalToPropagate: number
): SvelteSet<number> => {
	const complementaryOccurrencesState = stateMachine.getActiveState() as NonFinalState<
		DPLL_COMPLEMENTARY_OCCURRENCES_FUN,
		DPLL_COMPLEMENTARY_OCCURRENCES_INPUT
	>;
	if (complementaryOccurrencesState.run === undefined) {
		logFatal(
			'Function call error',
			'There should be a function in the Complementary Occurrences state'
		);
	}
	const clauses: SvelteSet<number> = complementaryOccurrencesState.run(literalToPropagate);
	stateMachine.transition('triggered_clauses_state');
	return clauses;
};

export const decide = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	const literalToPropagate: number = decideTransition(stateMachine);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};

const decideTransition = (stateMachine: DPLL_StateMachine): number => {
	const decideState = stateMachine.getActiveState() as NonFinalState<
		DPLL_DECIDE_FUN,
		DPLL_DECIDE_INPUT
	>;
	if (decideState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const literalToPropagate: number = decideState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

export const backtracking = (solver: DPLL_SolverMachine): void => {
	const stateMachine: DPLL_StateMachine = solver.stateMachine;
	const literalToPropagate = backtrackingTransition(stateMachine);
	const complementaryClauses: SvelteSet<number> = complementaryOccurrencesTransition(
		stateMachine,
		literalToPropagate
	);
	conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};

const backtrackingTransition = (stateMachine: DPLL_StateMachine): number => {
	const backtrackingState = stateMachine.getActiveState() as NonFinalState<
		DPLL_BACKTRACKING_FUN,
		DPLL_BACKTRACKING_INPUT
	>;
	if (backtrackingState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Decide state');
	}
	const literalToPropagate: number = backtrackingState.run();
	stateMachine.transition('complementary_occurrences_state');
	return literalToPropagate;
};

const emptyClauseSetTransition = (
	stateMachine: DPLL_StateMachine,
	solver: DPLL_SolverMachine
): void => {
	const emptyClauseSetState = stateMachine.getActiveState() as NonFinalState<
		DPLL_EMPTY_CLAUSE_SET_FUN,
		DPLL_EMPTY_CLAUSE_SET_INPUT
	>;
	if (emptyClauseSetState.run === undefined) {
		logFatal('Function call error', 'There should be a function in the Empty Clause Set state');
	}
	emptyClauseSetState.run(solver);
	stateMachine.transition('decision_level_state');
};
