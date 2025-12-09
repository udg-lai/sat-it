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
import type { CRef, Lit, Var } from '$lib/types/types.ts';
import type { Assignment } from '../interfaces/Assignment.ts';
import { isUnSAT } from '../interfaces/IClausePool.ts';
import { fromJust, isJust, type Maybe } from '../types/maybe.ts';

export const emptyClauseDetection = (pool: ClausePool): boolean => {
	const evaluation = pool.eval();
	return isUnSAT(evaluation);
};

export const unitClauseDetection = (pool: ClausePool): Set<CRef> => {
	const units: Clause[] = pool.getUnitClauses();
	return new Set(units.map((c) => c.getCRef()));
};

export const allAssigned = (pool: VariablePool): boolean => {
	return pool.allAssigned();
};

export const decide = (pool: VariablePool, algorithm: string): Lit => {
	const trail: Trail = obtainTrail();
	const assignmentEvent: AssignmentEvent = getAssignment();
	let manualAssignment: boolean = false;

	let varId: Var;
	if (assignmentEvent.type === 'automated') {
		const nextVariable: Maybe<Var> = pool.nextVariableToAssign();
		if (!isJust(nextVariable)) {
			logFatal('Decision', 'No variable to decide');
		}
		varId = fromJust(nextVariable);
	} else {
		manualAssignment = true;
		varId = assignmentEvent.variable;
	}

	const assignment: Assignment = {
		variable: varId,
		polarity: assignmentEvent.polarity
	};

	doAssignment(assignment);

	// This variable should contain the updated assignment done in `doAssignment`
	const variable: Variable = pool.getVariable(varId).copy();

	const tAssignment: VariableAssignment = manualAssignment
		? VariableAssignment.newManualAssignment(variable)
		: VariableAssignment.newAutomatedAssignment(variable, algorithm);

	trail.push(tAssignment);

	increaseNoDecisions();

	return variable.toLit();
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

	const assignment: Assignment = {
		variable: Literal.var(lit),
		polarity: lit > 0
	};

	doAssignment(assignment);

	const varId: Var = Literal.var(lit);
	const variable: Variable = variables.getVariable(varId).copy();

	const tAssignment: VariableAssignment =
		assignmentReason === 'up'
			? VariableAssignment.newUnitPropagationAssignment(variable, cRef)
			: VariableAssignment.newBackJumpingAssignment(variable, cRef);

	trail.push(tAssignment);

	increaseNoUnitPropagations();

	return lit;
};

const obtainTrail = (): Trail => {
	const trail: Trail = getLatestTrail() ?? new Trail();
	return trail;
};

export const complementaryOccurrences = (
	mapping: Map<Lit, Set<CRef>>,
	assignment: Lit
): Set<CRef> => {
	const complementary: Lit = Literal.complementary(assignment);
	const occurrences: Set<CRef> = mapping.get(complementary) ?? new Set<CRef>();
	return occurrences;
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

	const newTrail: Trail = latestTrail.copy();
	newTrail.cleanConflict();
	const lastAssignment: VariableAssignment = disposeUntilDecision(newTrail, pool);

	let variable: Variable = lastAssignment.getVariable().copy();

	if (!variable.hasTruthValue()) {
		logFatal(
			'Backtracking Assignment',
			`Variable ${variable.toInt()} has no assigned value before backtracking`
		);
	}

	variable.negate();
	const assignment = {
		variable: variable.toInt(),
		polarity: variable.getAssignment()
	};

	doAssignment(assignment);

	variable = pool.getVariable(variable.toInt()).copy();

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
