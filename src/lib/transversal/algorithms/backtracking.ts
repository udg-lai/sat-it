import type {
	AlgorithmParams,
	AlgorithmReturn,
	AlgorithmStep,
	Preprocessing,
	PreprocessingReturn
} from '$lib/store/problem.store.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
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

	const nextTrailsState: Trail[] =
		trails.length === 0 ? [new Trail(variables.nVariables())] : [...trails];

	let workingTrail = nextTrailsState[nextTrailsState.length - 1];

	//Assignació
	let literalToCheck: number;
	if (previousEval.type === 'UNSAT') {
		const newTrail: Trail = workingTrail.copy();
		const lastDecision = disposeUntilDecision(newTrail, variables);
		literalToCheck = backtracking(newTrail, variables, lastDecision.getVariable());
		nextTrailsState.push(newTrail);
		workingTrail = nextTrailsState[nextTrailsState.length - 1];
	} else {
		literalToCheck = followingAssignment(workingTrail, variables);
	}

	//Control d'errors
	let newEval: Eval;

	const clausesToCheck: Set<number> | undefined = mapping.get(literalToCheck);
	if (clausesToCheck) {
		newEval = clauses.partialEval(clausesToCheck);
	} else if (variables.allAssigned()) {
		newEval = clauses.eval();
	} else {
		newEval = { type: 'UNRESOLVED' };
	}
	if (newEval.type === 'SAT' && !variables.allAssigned()) {
		newEval = { type: 'UNRESOLVED' };
	}

	const end: boolean =
		(newEval.type === 'UNSAT' && workingTrail.getDecisionLevel() === 0) ||
		(newEval.type === 'SAT' && variables.allAssigned());

	console.log(newEval.type);
	return {
		type: newEval,
		end,
		trails: nextTrailsState
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
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithmName));
	return -variableId;
}
