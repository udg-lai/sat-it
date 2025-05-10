import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import {
	emptyClauseDetection as solverEmptyClauseDetection,
	unitClauseDetection as solverUnitClauseDetection,
	allAssigned as solverAllAssigned,
	stackClauseSet as solverStackClauseSet,
	unstackClauseSet as solverUnstackClauseSet
} from '$lib/transversal/algorithms/solver-functions.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { type Eval } from '$lib/transversal/interfaces/IClausePool.ts';
import { SolverStateMachine } from '../SolverStateMachine.ts';

// ** state inputs **

export type DPLL_EC_INPUT = 'ucd_state' | 'unsat_state';

export type DPLL_UCD_INPUT = 'stack_clause_set_state';

export type DPLL_OBTAIN_PENDING_CLAUSE_INPUT = 'pending_clauses_state' | 'unstack_clause_set_state';

export type DPLL_PENDING_CLAUSES_INPUT = 'all_assigned_state' | 'obtain_pending_clause_state';

export type DPLL_ALL_ASSIGNED_INPUT = 'sat_state' | 'decide_state';

export type DPLL_STACK_CLAUSE_SET_INPUT = 'pending_clauses_state'

export type DPLL_UNSTACK_CLAUSE_SET_INPUT = 'check_state';

export type DPLL_INPUT = 
	DPLL_EC_INPUT | 
	DPLL_UCD_INPUT | 
	DPLL_PENDING_CLAUSES_INPUT | 
	DPLL_OBTAIN_PENDING_CLAUSE_INPUT | 
	DPLL_ALL_ASSIGNED_INPUT | 
	DPLL_STACK_CLAUSE_SET_INPUT |
	DPLL_UNSTACK_CLAUSE_SET_INPUT; 

// ** state functions **

export type DPPL_DECIDE_FUN = (pool: VariablePool, assignmentEvent: AssignmentEvent) => boolean;

export const decide: DPPL_DECIDE_FUN = (pool: VariablePool, assignmentEvent: AssignmentEvent) => {
	return solverAllAssigned(pool);
}

export type DPPL_ALL_ASSIGNED_FUN = (pool: VariablePool) => boolean;

export const allAssigned: DPPL_ALL_ASSIGNED_FUN = (pool: VariablePool) => {
	return solverAllAssigned(pool);
}

export type DPPL_EC_FUN = (pool: ClausePool) => Eval;

export const emptyClauseDetection: DPPL_EC_FUN = (pool: ClausePool) => {
	return solverEmptyClauseDetection(pool);
};

export type DPLL_OBTAIN_PENDING_CLAUSE_FUN = (clauses: Set<number>) => number | undefined;

export const obtainPendingClause:  DPLL_OBTAIN_PENDING_CLAUSE_FUN = (clauses: Set<number>) => {
		const clausesIterator = clauses.values().next();
		const clauseId = clausesIterator.value;
		if (clauseId !== undefined) {
			clauses.delete(clauseId);
		}
		return clauseId;
}

export type DPLL_STACK_CLAUSE_SET_FUN = (clauses: Set<number>, solverStateMachine: SolverStateMachine) => void;

export const stackClauseSet: DPLL_STACK_CLAUSE_SET_FUN = (clauses: Set<number>, solverStateMachine: SolverStateMachine) => {
	return solverStackClauseSet(clauses, solverStateMachine);
};

export type DPLL_UNSTACK_CLAUSE_SET_FUN = (solverStateMachine: SolverStateMachine) => void;

export const unstackClauseSet: DPLL_UNSTACK_CLAUSE_SET_FUN = (solverStateMachine: SolverStateMachine) => {
	return solverUnstackClauseSet(solverStateMachine);
};

export type DPLL_UCD_FUN = (pool: ClausePool) => Set<number>;

export const unitClauseDetection: DPLL_UCD_FUN = (pool: ClausePool) => {
	return solverUnitClauseDetection(pool);
};

export type DPLL_PENDING_CLAUSES_FUN = (solverStateMachine: SolverStateMachine) => Set<number> | undefined;

export const nextPendingClause: DPLL_PENDING_CLAUSES_FUN = (solverStateMachine: SolverStateMachine) => {
	const pendingClause: Set<number>[] = solverStateMachine.getPendingClauses();
	return pendingClause.length === 0 ? undefined : pendingClause[0];
};

export type DPLL_FUN = 
	DPPL_EC_FUN | 
	DPLL_UCD_FUN | 
	DPLL_PENDING_CLAUSES_FUN | 
	DPLL_OBTAIN_PENDING_CLAUSE_FUN | 
	DPPL_ALL_ASSIGNED_FUN | 
	DPLL_STACK_CLAUSE_SET_FUN |
	DPLL_UNSTACK_CLAUSE_SET_FUN;
