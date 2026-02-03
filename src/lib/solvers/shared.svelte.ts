import type Clause from '$lib/entities/Clause.svelte.ts';
import type { ClauseEval } from '$lib/entities/Clause.svelte.ts';
import type ClausePool from '$lib/entities/ClausePool.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import type { EWC } from '$lib/entities/Problem.svelte.ts';
import { Trail } from '$lib/entities/Trail.svelte.ts';
import type Variable from '$lib/entities/Variable.svelte.ts';
import type { Assignment } from '$lib/entities/Variable.svelte.ts';
import VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { decisionMadeEventBus, newTrailStackedEventBus } from '$lib/events/events.ts';
import { getAssignment, type AssignmentEvent } from '$lib/states/assignment.svelte.ts';
import { isBreakpoint } from '$lib/states/breakpoints.svelte.ts';
import { getVariablePool } from '$lib/states/problem.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import {
	increaseNoConflicts,
	increaseNoUnitPropagations,
	updateClausesLeft
} from '$lib/states/statistics.svelte.ts';
import { logBreakpoint, logFatal } from '$lib/states/toasts.svelte.ts';
import { getLatestTrail, getTrails, stackTrail } from '$lib/states/trails.svelte.ts';
import { fromLeft, fromRight, isLeft } from '$lib/types/either.ts';
import type { CRef, Lit, Var } from '$lib/types/types.ts';
import { fromJust, isJust, type Maybe } from '../types/maybe.ts';

export const unaryEmptyClauseDetection = (pool: ClausePool): Set<CRef> => {
	const clauses: Clause[] = [...pool.getClauses((c: Clause) => c.isUnit() || c.isEmpty())];
	return new Set(clauses.map((c) => c.getCRef()));
};

export const allAssigned = (pool: VariablePool): boolean => {
	return pool.allAssigned();
};

export const decide = (pool: VariablePool, algorithm: string): Lit => {
	const trail: Trail = getLatestTrail();
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

	const truthValue: boolean = assignmentEvent.polarity;
	doAssignment(varId, truthValue);

	// This variable should contain the updated assignment done in `doAssignment`
	const variable: Variable = pool.getVariable(varId).copy();

	const varAssignment: VariableAssignment = manualAssignment
		? VariableAssignment.newManualAssignment(variable)
		: VariableAssignment.newAutomatedAssignment(variable, algorithm);

	trail.push(varAssignment);

	//Once all is done, let's send the event that a decision has been done
	decisionMadeEventBus.emit(variable.toLit());

	return variable.toLit();
};

export const clauseEvaluation = (pool: ClausePool, clauseTag: number): ClauseEval => {
	const clause = pool.at(clauseTag);
	const evaluation: ClauseEval = clause.eval();
	return evaluation;
};

export const unitPropagation = (
	variables: VariablePool,
	clauses: ClausePool,
	cRef: CRef,
	assignmentReason: 'up' | 'backjumping'
): Lit => {
	const trail: Trail = getLatestTrail();
	const clause: Clause = clauses.at(cRef);

	if (!clause.isUnit()) {
		logFatal('Unit Propagation', `Clause ${cRef} is not unit when performing unit propagation`);
	}

	const propagate: Literal = clause.fstUnassignedLiteral();
	const varId: Var = Literal.var(propagate.toInt());
	const truthValue: boolean = !Literal.hatted(propagate.toInt());

	doAssignment(varId, truthValue);

	const variable: Variable = variables.getVariable(varId).copy();

	const varAssignment: VariableAssignment =
		assignmentReason === 'up'
			? VariableAssignment.newUnitPropagationAssignment(variable, cRef)
			: VariableAssignment.newBackJumpingAssignment(variable, cRef);

	trail.push(varAssignment);

	increaseNoUnitPropagations();

	return propagate.toInt();
};

export const complementaryOccurrences = (
	mapping: Map<Lit, Set<CRef>>,
	assignment: Lit
): Set<CRef> => {
	const complementary: Lit = Literal.complementary(assignment);
	const occurrences: Set<CRef> = mapping.get(complementary) ?? new Set<CRef>();
	return occurrences;
};

export const atLevelZero = (): boolean => {
	// Check if the latest trail is at decision level 0
	const trail: Trail | undefined = getLatestTrail();
	if (trail === undefined) {
		logFatal('Non Decision Made', 'There is no trail to check for non decisions');
	}
	return trail.getDL() === 0;
};

const doAssignment = (varId: Var, assignment: Assignment): void => {
	// Notice that assignment \in { true, false, undefined }
	getVariablePool().assign(varId, assignment);
	updateClausesLeft(getTrails().length);
	if (assignment !== undefined) {
		// i.e., assignment is either true or false
		// Here assignment is inverted as when creating the literal the second parameter indicates if it has hat or not
		// 	thus indicating that if assignment is true it won't have, true otherwise.
		const hasHat: boolean = !assignment;
		handleBreakpoints(Literal.toLit(varId, hasHat));
	}
};

const handleBreakpoints = (assignment: Lit): void => {
	const solverMachine = getSolverMachine();
	const runningInAutoMode: boolean = solverMachine.runningOnAutomatic();
	const isBP: boolean = isBreakpoint(assignment);
	if (isBP) {
		const varId: Var = Literal.var(assignment);
		const hatted: boolean = Literal.hatted(assignment);
		logBreakpoint('Breakpoint', `Variable ${varId} assigned to ${!hatted}`);
	}
	if (runningInAutoMode && isBP) {
		solverMachine.stopRunningOnAutomatic();
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
	doAssignment(variable.toInt(), variable.getAssignment());

	variable = pool.getVariable(variable.toInt()).copy();

	if (!variable.hasTruthValue()) {
		logFatal(
			'Backtracking Assignment',
			`Variable ${variable.toInt()} has no assigned value after backtracking`
		);
	}
	newTrail.push(VariableAssignment.newBacktrackingAssignment(variable));

	increaseNoConflicts();
	stackTrail(newTrail);

	//Notify that a new trail has been pushed
	newTrailStackedEventBus.emit();

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

export const obtainCRefFromEWC = (watch: EWC): CRef => {
	return isLeft(watch) ? fromLeft(watch).cRef : fromRight(watch);
};
