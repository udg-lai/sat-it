import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import type { SolverStateMachine } from '$lib/machine/SolverStateMachine.ts';
import type { ClauseEval } from '../entities/Clause.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import type { AssignmentEval } from '../interfaces/IClausePool.ts';
import { logFatal } from '../logging.ts';

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
};

export const decide = (pool: VariablePool, assignmentEvent: AssignmentEvent) => {};

export const queueClauseSet = (clauses: Set<number>, solverStateMachine: SolverStateMachine) => {
	if (clauses.size === 0) {
		logFatal('Empty set of clauses are not thought to be queued');
	}
	solverStateMachine.postpone(clauses);
};

export const dequeueClauseSet = (solverStateMachine: SolverStateMachine) => {
	solverStateMachine.resolvePostponed();
};

export const clauseEvaluation = (pool: ClausePool, clauseId: number): ClauseEval => {
	const clause = pool.get(clauseId);
	const evaluation: ClauseEval = clause.eval();
	return evaluation;
};

export const triggeredClauses = (clauses: Set<number>): boolean => {
	return clauses.size !== 0;
};
