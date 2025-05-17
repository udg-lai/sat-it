import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import { getAssignment } from '$lib/store/assignment.svelte.ts';
import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import { getLatestTrail, stackTrail, unstackTrail } from '$lib/store/trails.svelte.ts';
import type Clause from '../entities/Clause.ts';
import type { ClauseEval } from '../entities/Clause.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import { isUnSAT } from '../interfaces/IClausePool.ts';
import { logFatal } from '../logging.ts';
import { fromJust, isJust } from '../types/maybe.ts';

export const emptyClauseDetection = (pool: ClausePool): boolean => {
	const evaluation = pool.eval();
	return isUnSAT(evaluation);
};

export const unitClauseDetection = (pool: ClausePool): Set<number> => {
	const unitClauses: Set<number> = pool.getUnitClauses();
	return unitClauses;
};

export const allAssigned = (pool: VariablePool): boolean => {
	return pool.allAssigned();
};

export const decide = (pool: VariablePool, method: string): number => {
	const trail: Trail = obtainTrail(pool);
	const assignmentEvent: AssignmentEvent = getAssignment();

	let variableId: number;
	if (assignmentEvent.type === 'automated') {
		const nextVariable = pool.nextVariableToAssign();
		if (!isJust(nextVariable)) {
			logFatal('Decision Node', 'No variable to decide');
		}
		variableId = fromJust(nextVariable);
	} else {
		method = 'manual';
		variableId = assignmentEvent.variable;
	}

	pool.persist(variableId, assignmentEvent.polarity);
	const variable = pool.getCopy(variableId);
	if (method === 'manual') {
		trail.push(VariableAssignment.newManualAssignment(variable));
	} else {
		trail.push(VariableAssignment.newAutomatedAssignment(variable, method));
	}
	stackTrail(trail);
	return assignmentEvent.polarity ? variableId : -variableId;
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
	const clause: Clause = clauses.get(clauseId);
	const literalToPropagate: number = clause.findUnassignedLiteral();

	const polarity: boolean = literalToPropagate > 0;
	const variableId: number = Math.abs(literalToPropagate);

	variables.persist(variableId, polarity);
	const variable: Variable = variables.getCopy(variableId);
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

export const nonDecisionMade = (): boolean => {
	const trail: Trail = getLatestTrail() as Trail;
	return trail.getDecisionLevel() === 0;
};

export const backtracking = (pool: VariablePool): number => {
	const trail: Trail = (getLatestTrail() as Trail).copy();
	const lastVariableAssignment: VariableAssignment = disposeUntilDecision(trail, pool);

	const lastVariable: Variable = lastVariableAssignment.getVariable();
	const polarity: boolean = !lastVariable.getAssignment();
	pool.dispose(lastVariable.getInt());
	pool.persist(lastVariable.getInt(), polarity);
	const variable = pool.getCopy(lastVariable.getInt());
	trail.push(VariableAssignment.newBacktrackingAssignment(variable));
	trail.updateFollowUpIndex();

	stackTrail(trail);
	return polarity ? -lastVariable.getInt() : lastVariable.getInt();
};

const disposeUntilDecision = (trail: Trail, variables: VariablePool): VariableAssignment => {
	let last = trail.pop();
	while (last && !last.isD()) {
		variables.dispose(last.getVariable().getInt());
		last = trail.pop();
	}
	if (!last) {
		throw logFatal('No backtracking was made', 'There was no decision left to backtrack');
	}
	return last;
};
