import type Clause from '$lib/entities/Clause.svelte.ts';
import type { ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import { Trail } from '$lib/entities/Trail.svelte.ts';
import type Variable from '$lib/entities/Variable.svelte.ts';
import VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { getAssignment, type AssignmentEvent } from '$lib/states/assignment.svelte.ts';
import { isBreakpoint } from '$lib/states/breakpoints.svelte.ts';
import { getVariablePool } from '$lib/states/problem.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import {
	increaseNoConflicts,
	increaseNoDecisions,
	increaseNoUnitPropagations,
	updateClausesLeft
} from '$lib/states/statistics.svelte.ts';
import { logBreakpoint, logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, getTrails, stackTrail } from '$lib/states/trails.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import { SvelteSet } from 'svelte/reactivity';
import type { Assignment } from '../interfaces/Assignment.ts';
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
	const trail: Trail = obtainTrail();
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

	const truthAssignment: Assignment = {
		variable: variableId,
		polarity: assignmentEvent.polarity
	};

	doAssignment(truthAssignment);

	const variable: Variable = pool.getVariable(variableId).copy();
	if (manualAssignment) {
		trail.push(VariableAssignment.newManualAssignment(variable));
	} else {
		trail.push(VariableAssignment.newAutomatedAssignment(variable, algorithm));
	}

	increaseNoDecisions();

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
	cRef: CRef,
	assignmentReason: 'up' | 'backjumping'
): Lit => {
	const trail: Trail = obtainTrail();
	const clause: Clause = clauses.get(cRef);

	if (!clause.isUnit()) {
		logFatal('Unit Propagation', `Clause ${cRef} is not unit when performing unit propagation`);
	}

	const propagate: Literal = clause.fstUnassignedLiteral();
	const lit: Lit = propagate.toInt();

	const truthAssignment: Assignment = {
		variable: Literal.var(lit),
		polarity: lit > 0
	};

	doAssignment(truthAssignment);

	const variable: Variable = variables.getVariable(Literal.var(lit)).copy();
	if (assignmentReason === 'up') {
		trail.push(VariableAssignment.newUnitPropagationAssignment(variable, cRef));
	} else {
		trail.push(VariableAssignment.newBackjumpingAssignment(variable, cRef));
	}

	increaseNoUnitPropagations();

	return lit;
};

const obtainTrail = (): Trail => {
	const trail: Trail = getLatestTrail() ?? new Trail();
	return trail;
};

export const complementaryOccurrences = (
	mapping: Map<Lit, Set<CRef>>,
	literal: number
): SvelteSet<number> => {
	const comp: number = Literal.complementary(literal);
	const mappingReturn: Set<CRef> | undefined = mapping.get(comp);
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

const doAssignment = (assignment: Assignment): void => {
	const variables: VariablePool = getVariablePool();
	variables.assign(assignment.variable, assignment.polarity);
	handleBreakpoints(assignment);
	updateClausesLeft(getTrails().length);
};

const handleBreakpoints = (assignment: Assignment): void => {
	const solverMachine = getSolverMachine();
	const runningInAutoMode: boolean = solverMachine.isInAutoMode();
	const { variable, polarity } = assignment;
	const literal: number = polarity ? variable : variable * -1;
	const isBP: boolean = isBreakpoint(literal);
	if (isBP) {
		logBreakpoint('Breakpoint', `Variable ${variable} assigned to ${polarity}`);
	}
	if (runningInAutoMode && isBP) {
		solverMachine.stopAutoMode();
	}
};

export const backtracking = (pool: VariablePool): Lit => {
	const latestTrail = getLatestTrail();
	if (latestTrail === undefined) {
		logFatal('Backtracking', 'No trail found');
	} else {
		latestTrail.setState('conflict');
	}

	const newTrail: Trail = latestTrail.partialCopy();
	const lastAssignment: VariableAssignment = disposeUntilDecision(newTrail, pool);

	const varAssignment: Variable = lastAssignment.getVariable().copy();

	if (!varAssignment.hasTruthValue()) {
		logFatal(
			'Backtracking Assignment',
			`Variable ${varAssignment.toInt()} has no assigned value before backtracking`
		);
	}

	varAssignment.negate();

	const assignment = {
		variable: varAssignment.toInt(),
		polarity: varAssignment.getAssignment()
	};

	doAssignment(assignment);

	const variable: Variable = pool.getVariable(varAssignment.toInt());

	if (!variable.hasTruthValue()) {
		logFatal(
			'Backtracking Assignment',
			`Variable ${variable.toInt()} has no assigned value after backtracking`
		);
	}

	newTrail.push(VariableAssignment.newBacktrackingAssignment(variable));
	newTrail.setFollowUpIndex();

	increaseNoConflicts();
	stackTrail(newTrail);

	return variable.toLit();
};

const disposeUntilDecision = (trail: Trail, variables: VariablePool): VariableAssignment => {
	let last = trail.pop();
	while (last && !last.isD()) {
		variables.unassign(last.getVariable().toInt());
		last = trail.pop();
	}
	if (!last) {
		throw logFatal('No backtracking was made', 'There was no decision left to backtrack');
	}
	return last;
};

export const finalStateControl = (): void => {
	const latest = getLatestTrail();
	if (latest === undefined) {
		logFatal('Final state', 'Should be at least one trail');
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
};
