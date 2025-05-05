import type { ClauseEval } from '../entities/Clause.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import { isUnsat } from '../utils/interfaces/IClausePool.ts';
import { logFatal } from '../utils/logging.ts';
import type {
	ConflictDetectionParams,
	ConflictDetectionReturn,
	PreprocesCDParams,
	PreprocesCDRetur,
	PreprocesUnitClauseParams,
	PreprocesUnitClauseReturn,
	StepParams,
	StepResult,
	UnitPropagationParams,
	UnitPropagationReturn
} from '../utils/types/algorithms.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export const dpllname: string = 'dpll';

export const dpllPreprocesCD = (params: PreprocesCDParams): PreprocesCDRetur => {
	const { clauses } = params;
	const evaluation = clauses.eval();
	return { evaluation };
};

export const dpllPreprocesUnitClause = (
	params: PreprocesUnitClauseParams
): PreprocesUnitClauseReturn => {
	const { clauses } = params;
	const clausesToCheck: Set<number> = clauses.getUnitClauses();
	return { clausesToCheck };
};

export const dpllAlgorithmStep = (params: StepParams): StepResult => {
	const { variables, mapping, trails, previousEval } = params;

	const nextTrailsState: Trail[] =
		trails.length === 0 ? [new Trail(variables.nVariables())] : [...trails];

	let workingTrail = nextTrailsState[nextTrailsState.length - 1];

	let literalToCheck: number;

	if (isUnsat(previousEval)) {
		const newTrail: Trail = workingTrail.copy();
		const lastVariable: VariableAssignment = disposeUntilDecision(newTrail, variables);
		literalToCheck = backtracking(newTrail, variables, lastVariable.getVariable());
		nextTrailsState.push(newTrail);
		workingTrail = nextTrailsState[nextTrailsState.length - 1];
	} else {
		literalToCheck = followingAssignment(workingTrail, variables);
	}

	let clausesToCheck: Set<number> | undefined = mapping.get(literalToCheck);
	if (!clausesToCheck) {
		clausesToCheck = new Set<number>();
	}
	return { clausesToCheck, trails: nextTrailsState };
};

export const dpllUnitPropagation = (params: UnitPropagationParams): UnitPropagationReturn => {
	const { variables, trails, literalToPropagate } = params;
	const nextTrailsState: Trail[] =
		trails.length === 0 ? [new Trail(variables.nVariables())] : [...trails];

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	const polarity = literalToPropagate > 0;
	const variableId = Math.abs(literalToPropagate);

	variables.persist(variableId, polarity);
	const variable = variables.getCopy(variableId);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, dpllname));
	return { trails: nextTrailsState };
};

export const dpllConflictDetection = (params: ConflictDetectionParams): ConflictDetectionReturn => {
	const { clause } = params;
	console.log('Evaluation Clause', clause);
	const evaluation: ClauseEval = clause.eval();
	return { evaluation };
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
		logFatal('DPLL Algorithm', 'No variable to decide');
	}
	const variableId = fromJust(nextVariable);
	variables.persist(variableId, true);
	const variable = variables.getCopy(variableId);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, dpllname));
	return -variableId;
}
