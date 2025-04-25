import type { AlgorithmParams, AlgorithmReturn, AlgorithmStep } from '$lib/store/problem.store.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import { logFatal } from '../utils/logging.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export const algorithmName = 'backtracking';

export const backtrackingAlgorithm: AlgorithmStep = (params: AlgorithmParams): AlgorithmReturn => {
	const { trails, variables, clauses } = params;

	let nextTrailsState: Trail[] = [];

	if (trails.length === 0) {
		nextTrailsState = [new Trail(variables.nVariables())];
	} else {
		nextTrailsState = [...trails];
	}

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	const clauseEval = clauses.eval();
	if (clauseEval.type === 'UNSAT') {
		if (workingTrail.getDecisionLevel() === 0) {
			return {
				type: clauseEval,
				end: true,
				trails: trails
			};
		} else {
			const newTrail = backtracking(workingTrail.copy(), variables);
			nextTrailsState.push(newTrail);
			return {
				type: clauseEval,
				end: false,
				trails: nextTrailsState
			};
		}
	} else {
		if (variables.allAssigned()) {
			return {
				type: clauseEval,
				end: true,
				trails: trails
			};
		}
		const nextVariable = variables.nextVariableToAssign();
		if (!isJust(nextVariable)) {
			logFatal('Backtracking Algorithm', 'No variable to decide');
		}
		const variableId = fromJust(nextVariable);
		variables.persist(variableId, true);
		const variable = variables.getCopy(variableId);
		workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithmName));
		return {
			type: clauseEval,
			end: false,
			trails: nextTrailsState
		};
	}
};

const backtracking = (workingTail: Trail, variables: VariablePool): Trail => {
	let backtrack = false;
	let lastDecision: VariableAssignment | undefined = workingTail.pop();
	while (!backtrack && lastDecision !== undefined) {
		const lastVariable = lastDecision.getVariable();
		variables.dispose(lastVariable.getInt());
		if (lastDecision.isD()) {
			backtrack = true;
			variables.persist(lastVariable.getInt(), !lastVariable.getAssignment());
			const variable = variables.getCopy(lastVariable.getInt());
			workingTail.push(VariableAssignment.newBacktrackingAssignment(variable));
			workingTail.updateFollowUpIndex();
		} else {
			lastDecision = workingTail.pop();
		}
	}
	if (lastDecision === undefined) {
		throw logFatal(
			'No backtracking was made',
			'A backtraaking action should have been made, but nothing happened'
		);
	}
	return workingTail;
};
