import type {
	AlgorithmParams,
	AlgorithmReturn,
	AlgorithmStep,
	Preprocessing,
	PreprocessingReturn
} from '$lib/store/problem.store.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import type { Eval } from '../utils/interfaces/IClausePool.ts';
import { logFatal } from '../utils/logging.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export const algorithmName = 'backtracking';

export const backtrackingPreprocessing: Preprocessing = (
	clauses: ClausePool
): PreprocessingReturn => {
	const evaluation = clauses.eval();
	let end = false;
	if (evaluation.type !== 'UNRESOLVED') end = true;
	return {
		eval: evaluation,
		end
	};
};

export const backtrackingAlgorithm: AlgorithmStep = (params: AlgorithmParams): AlgorithmReturn => {
	const { trails, variables, clauses, mapping, previousEval } = params;

	let nextTrailsState: Trail[] = [];
	let end: boolean = false;
	let literalToCheck = 0;

	if (trails.length === 0) {
		nextTrailsState = [new Trail(variables.nVariables())];
	} else {
		nextTrailsState = [...trails];
	}

	let workingTrail = nextTrailsState[nextTrailsState.length - 1];

	//Assignació
	if (previousEval.type === 'UNSAT') {
		if (workingTrail.getDecisionLevel() === 0) {
			logFatal('Backtracking Error', 'You are not suposed to get here');
		} else {
			const newTrail: Trail = workingTrail.copy();
			literalToCheck = backtracking(newTrail, variables);
			nextTrailsState.push(newTrail);
			workingTrail = nextTrailsState[nextTrailsState.length - 1];
		}
	} else {
		if (variables.allAssigned()) {
			logFatal('Backtracking Error', 'You are not suposed to get here');
		} else {
			literalToCheck = followingAssignment(workingTrail, variables);
		}
	}
	//Control d'errors
	if (literalToCheck === 0) {
		logFatal('Backtracking Error', 'No variable was assigned');
	}
	let newEval: Eval = previousEval;
	const clausesToCheck: Set<number> | undefined = mapping.get(literalToCheck);
	if (clausesToCheck !== undefined) {
		newEval = clauses.partialEval(clausesToCheck);
	} else {
		newEval = variables.allAssigned() ? { type: 'SAT' } : { type: 'UNRESOLVED' };
	}
	console.log(newEval.type);
	if (
		(newEval.type === 'UNSAT' && workingTrail.getDecisionLevel() === 0) ||
		(newEval.type === 'SAT' && variables.allAssigned())
	)
		end = true;
	return {
		type: newEval,
		end,
		trails: nextTrailsState
	};
};

const backtracking = (workingTail: Trail, variables: VariablePool): number => {
	let backtrack = false;
	let lastDecision: VariableAssignment | undefined = workingTail.pop();
	let polarity: boolean | undefined = undefined;

	while (!backtrack && lastDecision !== undefined) {
		const lastVariable = lastDecision.getVariable();
		variables.dispose(lastVariable.getInt());
		if (lastDecision.isD()) {
			backtrack = true;
			polarity = !lastVariable.getAssignment();
			variables.persist(lastVariable.getInt(), polarity);
			const variable = variables.getCopy(lastVariable.getInt());
			workingTail.push(VariableAssignment.newBacktrackingAssignment(variable));
			workingTail.updateFollowUpIndex();
		} else {
			lastDecision = workingTail.pop();
		}
	}
	if (lastDecision === undefined || polarity === undefined) {
		throw logFatal(
			'No backtracking was made',
			'A backtraaking action should have been made, but nothing happened'
		);
	} else {
		return polarity ? -lastDecision.getVariable().getInt() : lastDecision.getVariable().getInt();
	}
};

function followingAssignment(workingTrail: Trail, variables: VariablePool): number {
	const nextVariable = variables.nextVariableToAssign();
	if (!isJust(nextVariable)) {
		logFatal('Backtracking Algorithm', 'No variable to decide');
	}
	const variableId = fromJust(nextVariable);
	variables.persist(variableId, true);
	const variable = variables.getCopy(variableId);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithmName));
	return -variableId;
}
