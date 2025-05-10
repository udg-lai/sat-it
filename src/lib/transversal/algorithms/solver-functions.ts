import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import type { SolverStateMachine } from '$lib/machine/SolverStateMachine.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import type { AssignmentEval } from '../interfaces/IClausePool.ts';

export const emptyClauseDetection = (pool: ClausePool): AssignmentEval => {
	const evaluation = pool.eval();
	return evaluation;
};

export const unitClauseDetection = (pool: ClausePool): Set<number> => {
	const unitClauses: Set<number> = pool.getUnitClauses();
	return unitClauses;
};

export const allAssigned = (pool: VariablePool): boolean => {
	return pool.allAssigned();
}

export const decide = (pool: VariablePool, assignmentEvent: AssignmentEvent) => {


}

export const stackClauseSet = (clauses: Set<number>, solverStateMachine: SolverStateMachine) => {
	solverStateMachine.stackPendingClauses(clauses);
}

export const unstackClauseSet = (solverStateMachine: SolverStateMachine) => {
	solverStateMachine.unstackPendingClauses();
}