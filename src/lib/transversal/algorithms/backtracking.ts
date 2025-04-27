import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import {
	isSat,
	isUnresolved,
	isUnsat,
	makeUnresolved,
	type Eval
} from '../utils/interfaces/IClausePool.ts';
import { logFatal } from '../utils/logging.ts';
import type {
	AlgorithmParams,
	AlgorithmReturn,
	AlgorithmStep,
	ConflictDetecion,
	ConflictDetecionParams,
	ConflictDetecionReturn,
	Preprocessing,
	PreprocessingReturn
} from '../utils/types/algorithm.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export const backtrackingName = 'backtracking';

export const backtrackingPreprocessing: Preprocessing = (
	clauses: ClausePool
): PreprocessingReturn => {
	const evaluation = clauses.eval();
	let end = false;
	if (!isUnresolved(evaluation)) end = true;
	return {
		eval: evaluation,
		end
	};
};

export const backtrackingAlgorithm: AlgorithmStep = (params: AlgorithmParams): AlgorithmReturn => {
	const { trails, variables, clauses, mapping, previousEval } = params;

	const nextTrailsState: Trail[] =
		trails.length === 0 ? [new Trail(variables.nVariables())] : [...trails];

	let workingTrail = nextTrailsState[nextTrailsState.length - 1];

	//Assignació
	let literalToCheck: number;
	if (isUnsat(previousEval)) {
		const newTrail: Trail = workingTrail.copy();
		const lastDecision = disposeUntilDecision(newTrail, variables);
		literalToCheck = backtracking(newTrail, variables, lastDecision.getVariable());
		nextTrailsState.push(newTrail);
		workingTrail = nextTrailsState[nextTrailsState.length - 1];
	} else {
		literalToCheck = followingAssignment(workingTrail, variables);
	}

	//Control d'errors
	const clausesToCheck: Set<number> | undefined = mapping.get(literalToCheck);
	const { eval: newEval, end } = backtrackingConflictDetection({
		workingTrail,
		variables,
		clauses,
		clausesToCheck
	});

	return {
		eval: newEval,
		end,
		trails: nextTrailsState
	};
};

export const backtrackingConflictDetection: ConflictDetecion = (
	params: ConflictDetecionParams
): ConflictDetecionReturn => {
	const { workingTrail, variables, clauses, clausesToCheck } = params;
	let newEval: Eval;
	if (clausesToCheck) {
		newEval = clauses.partialEval(clausesToCheck);
	} else if (variables.allAssigned()) {
		newEval = clauses.eval();
	} else {
		newEval = makeUnresolved();
	}
	if (isSat(newEval) && !variables.allAssigned()) {
		newEval = makeUnresolved();
	}

	const end: boolean =
		(isUnsat(newEval) && workingTrail.getDecisionLevel() === 0) ||
		(isSat(newEval) && variables.allAssigned());
	return {
		eval: newEval,
		end
	};
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

const backtracking = (
	workingTail: Trail,
	variables: VariablePool,
	lastVariable: Variable
): number => {
	const polarity: boolean = !lastVariable.getAssignment();
	variables.dispose(lastVariable.getInt());
	variables.persist(lastVariable.getInt(), polarity);
	const variable = variables.getCopy(lastVariable.getInt());
	workingTail.push(VariableAssignment.newBacktrackingAssignment(variable));
	workingTail.updateFollowUpIndex();

	const litValue = polarity ? -lastVariable.getInt() : lastVariable.getInt();
	return litValue;
};

function followingAssignment(workingTrail: Trail, variables: VariablePool): number {
	const nextVariable = variables.nextVariableToAssign();
	if (!isJust(nextVariable)) {
		logFatal('Backtracking Algorithm', 'No variable to decide');
	}
	const variableId = fromJust(nextVariable);
	variables.persist(variableId, true);
	const variable = variables.getCopy(variableId);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, backtrackingName));
	return -variableId;
}
