import type Clause from '$lib/entities/Clause.svelte.ts';
import type { ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { Trail } from '$lib/entities/Trail.svelte.ts';
import type Variable from '$lib/entities/Variable.svelte.ts';
import VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { getAssignment, type AssignmentEvent } from '$lib/states/assignment.svelte.ts';
import { isBreakpoint } from '$lib/states/breakpoints.svelte.ts';
import { getProblemStore, type MappingLiteral2Clauses } from '$lib/states/problem.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import {
	increaseNoConflicts,
	increaseNoDecisions,
	increaseNoUnitPropagations,
	updateClausesLeft
} from '$lib/states/statistics.svelte.ts';
import { getLatestTrail, getTrails, stackTrail, unstackTrail } from '$lib/states/trails.svelte.ts';
import { logBreakpoint, logFatal } from '$lib/stores/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';
import { isUnSAT } from '../interfaces/IClausePool.ts';
import type { TruthAssignment } from '../interfaces/TruthAssignment.ts';
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

	const truthAssignment: TruthAssignment = {
		variable: variableId,
		polarity: assignmentEvent.polarity
	};

	doAssignment(truthAssignment);

	const variable = pool.getVariableCopy(variableId);
	if (manualAssignment) {
		trail.push(VariableAssignment.newManualAssignment(variable));
	} else {
		trail.push(VariableAssignment.newAutomatedAssignment(variable, algorithm));
	}

	increaseNoDecisions();

	stackTrail(trail);

	return assignmentEvent.polarity ? variableId : -variableId;
};

export const clauseEvaluation = (pool: ClausePool, clauseTag: number): ClauseEval => {
	const clause = pool.get(clauseTag);
	const evaluation: ClauseEval = clause.eval();
	return evaluation;
};

export const unitPropagation = (
	variables: VariablePool,
	clauses: ClausePool,
	clauseTag: number,
	assignmentReason: 'up' | 'backjumping'
): number => {
	const trail: Trail = obtainTrail(variables);
	const clause: Clause = clauses.get(clauseTag);
	const literalToPropagate: number = clause.findUnassignedLiteral();

	const polarity: boolean = literalToPropagate > 0;
	const variableId: number = Math.abs(literalToPropagate);

	const truthAssignment: TruthAssignment = {
		variable: variableId,
		polarity
	};

	doAssignment(truthAssignment);

	const variable: Variable = variables.getVariableCopy(variableId);
	if (assignmentReason === 'up') {
		trail.push(VariableAssignment.newUnitPropagationAssignment(variable, clauseTag));
	} else {
		trail.push(VariableAssignment.newBackjumpingAssignment(variable, clauseTag));
	}

	increaseNoUnitPropagations();
	stackTrail(trail);
	return literalToPropagate;
};

const obtainTrail = (variables: VariablePool): Trail => {
	const trail: Trail = getLatestTrail() ?? new Trail(variables.size());
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
	const trail: Trail | undefined = getLatestTrail();
	if (trail === undefined) {
		logFatal('Non Decision Made', 'There is no trail to check for non decisions');
	}
	return trail.getDecisionLevel() === 0;
};

const doAssignment = (truthAssignment: TruthAssignment): void => {
	const { variables } = getProblemStore();
	variables.assign(truthAssignment.variable, truthAssignment.polarity);
	handleBreakpoints(truthAssignment);
	updateClausesLeft(getTrails().length);
};

const handleBreakpoints = (truthAssignment: TruthAssignment): void => {
	const solverMachine = getSolverMachine();
	const runningInAutoMode: boolean = solverMachine.isInAutoMode();
	const { variable, polarity } = truthAssignment;
	const literal: number = polarity ? variable : variable * -1;
	const isBP: boolean = isBreakpoint(literal);
	if (isBP) {
		logBreakpoint('Breakpoint', `Variable ${variable} assigned to ${polarity}`);
	}
	if (runningInAutoMode && isBP) {
		solverMachine.stopAutoMode();
	}
};

export const backtracking = (pool: VariablePool): number => {
	const latestTrail = getLatestTrail();
	if (latestTrail === undefined) {
		logFatal('Backtracking', 'No trail found')
	}
	else {
		latestTrail.setState('conflict');
	}

	const newTrail: Trail = latestTrail.partialCopy();
	const lastVariableAssignment: VariableAssignment = disposeUntilDecision(newTrail, pool);

	const lastVariable: Variable = lastVariableAssignment.getVariable();
	const polarity: boolean = !lastVariable.getAssignment();

	const assignment = {
		variable: lastVariable.getInt(),
		polarity
	};

	doAssignment(assignment);

	const variable = pool.getVariableCopy(lastVariable.getInt());
	newTrail.push(VariableAssignment.newBacktrackingAssignment(variable));
	newTrail.setFollowUpIndex();

	increaseNoConflicts();
	stackTrail(newTrail);
	return polarity ? lastVariable.getInt() : -lastVariable.getInt();
};

const disposeUntilDecision = (trail: Trail, variables: VariablePool): VariableAssignment => {
	let last = trail.pop();
	while (last && !last.isD()) {
		variables.unassign(last.getVariable().getInt());
		last = trail.pop();
	}
	if (!last) {
		throw logFatal('No backtracking was made', 'There was no decision left to backtrack');
	}
	return last;
};

export const finalStateRun = (): void => {
	const latest = getLatestTrail();
	if (latest === undefined) {
		logFatal('Final state', 'Should be at least one trail')
	}
	const solver = getSolverMachine();
	if (solver.onFinalState()) {
		if (solver.onSatSate()) {
			latest.setState('sat');
		} else {
			latest.setState('unsat');
		}
	} else {
		logFatal('Final state', 'Solver is not on final state');
	}
}
