import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import type { SolverStateMachine } from '$lib/machine/SolverStateMachine.ts';
import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import { getLatestTrail, stackTrail, unstackTrail } from '$lib/store/trails.svelte.ts';
import type { ClauseEval, UNITClause } from '../entities/Clause.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
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

export const unitPropagation = (
	variables: VariablePool,
	clauses: ClausePool,
	clauseId: number
): number => {
	const trail: Trail = obtainTrail(variables);
	const evaluation: UNITClause = clauseEvaluation(clauses, clauseId) as UNITClause;
	const literalToPropagate = evaluation.literal;

	const polarity = literalToPropagate > 0;
	const variableId = Math.abs(literalToPropagate);

	variables.persist(variableId, polarity);
	const variable = variables.getCopy(variableId);
	trail.push(VariableAssignment.newUnitPropagationAssignment(variable, clauseId));

	stackTrail(trail);
	return literalToPropagate;
};

const obtainTrail = (variables: VariablePool): Trail => {
	const trail: Trail = getLatestTrail() ?? new Trail(variables.nVariables());
	unstackTrail();
	return trail;
};

export const complementaryOccurrences = (
	mapping: MappingLiteral2Clauses,
	literal: number
): Set<number> => {
	return mapping.get(-literal) ?? new Set<number>();
};
