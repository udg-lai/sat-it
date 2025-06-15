import type { AssignmentEvent } from '$lib/components/debugger/events.svelte.ts';
import { getAssignment } from '$lib/store/assignment.svelte.ts';
import { markedAsBreakpoint, type Assignment } from '$lib/store/breakpoints.svelte.ts';
import { getProblemStore, type MappingLiteral2Clauses } from '$lib/store/problem.svelte.ts';
import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
import {
	increaseNoConflicts,
	increaseNoDecisions,
	increaseNoUnitPropagations as increaseNoUnitPropagations,
	updateClausesLeft
} from '$lib/store/statistics.svelte.ts';
import { logBreakpoint, logFatal } from '$lib/store/toasts.ts';
import { getLatestTrail, getTrails, stackTrail, unstackTrail } from '$lib/store/trails.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { ClauseEval } from '../entities/Clause.ts';
import type Clause from '../entities/Clause.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import { isUnSAT } from '../interfaces/IClausePool.ts';
import { fromJust, isJust } from '../types/maybe.ts';

export const emptyClauseDetection = (pool: ClausePool): boolean => {
	const evaluation = pool.eval();
	return isUnSAT(evaluation);
};

export const unitClauseDetection = (pool: ClausePool): SvelteSet<number> => {
	const unitClauses: SvelteSet<number> = pool.getUnitClauses();
	return unitClauses;
};

export const allAssigned = (pool: VariablePool): boolean => {
	return pool.allAssigned();
};

export const decide = (pool: VariablePool, algorithm: string): number => {
	const trail: Trail = obtainTrail(pool);
	const assignmentEvent: AssignmentEvent = getAssignment();
	let manualAssignment: boolean = false;

	let variableId: number;
	if (assignmentEvent.type === 'automated') {
		const nextVariable = pool.nextVariableToAssign();
		if (!isJust(nextVariable)) {
			logFatal('Decision Node', 'No variable to decide');
		}
		variableId = fromJust(nextVariable);
	} else {
		manualAssignment = true;
		variableId = assignmentEvent.variable;
	}

	doAssignment(variableId, assignmentEvent.polarity);

	const variable = pool.getCopy(variableId);
	if (manualAssignment) {
		trail.push(VariableAssignment.newManualAssignment(variable));
	} else {
		trail.push(VariableAssignment.newAutomatedAssignment(variable, algorithm));
	}

	increaseNoDecisions();

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

	doAssignment(variableId, polarity);

	const variable: Variable = variables.getCopy(variableId);
	trail.push(VariableAssignment.newUnitPropagationAssignment(variable, clauseId));

	increaseNoUnitPropagations();
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
): SvelteSet<number> => {
	const mappingReturn: SvelteSet<number> | undefined = mapping.get(-literal);
	const complementaryOccurrences: SvelteSet<number> = new SvelteSet<number>();
	if (mappingReturn !== undefined) {
		for (const clause of mappingReturn) {
			complementaryOccurrences.add(clause);
		}
	}
	return complementaryOccurrences;
};

export const nonDecisionMade = (): boolean => {
	const trail: Trail = getLatestTrail() as Trail;
	return trail.getDecisionLevel() === 0;
};

const doAssignment = (variableId: number, polarity: boolean): void => {
	const { variables } = getProblemStore();

	variables.persist(variableId, polarity);

	const assignment: Assignment = {
		type: 'variable',
		id: variableId
	};

	afterAssignment(assignment);
};

const afterAssignment = (assignment: Assignment): void => {
	const solverMachine = getSolverMachine();
	const runningInAutoMode: boolean = solverMachine.isInAutoMode();
	const isBreakpoint: boolean = markedAsBreakpoint(assignment);
	if (isBreakpoint) {
		logBreakpoint('Variable breakpoint', `Variable ${assignment.id} assigned`);
	}
	if (runningInAutoMode && isBreakpoint) {
		solverMachine.stopAutoMode();
	}
	updateClausesLeft(getTrails().length);
};

export const backtracking = (pool: VariablePool): number => {
	const trail: Trail = (getLatestTrail() as Trail).partialCopy();
	const lastVariableAssignment: VariableAssignment = disposeUntilDecision(trail, pool);

	const lastVariable: Variable = lastVariableAssignment.getVariable();
	const polarity: boolean = !lastVariable.getAssignment();
	pool.dispose(lastVariable.getInt());

	doAssignment(lastVariable.getInt(), polarity);

	const variable = pool.getCopy(lastVariable.getInt());
	trail.push(VariableAssignment.newBacktrackingAssignment(variable));
	trail.updateFollowUpIndex();

	increaseNoConflicts();
	stackTrail(trail);
	return polarity ? lastVariable.getInt() : -lastVariable.getInt();
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
