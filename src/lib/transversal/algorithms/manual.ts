import type { ManualAssignment } from '$lib/components/debugger/events.svelte.ts';
import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import type ClausePool from '../entities/ClausePool.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import type { AssignmentResult, ConflictDetecion } from '../utils/types/algorithm.ts';

export interface ManualParams {
	assignment: ManualAssignment;
	trails: Trail[];
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	conflictDetectionAlgorithm: ConflictDetecion;
}

export function manualAssignment(params: ManualParams): AssignmentResult {
	const { assignment, trails, variables, clauses, mapping, conflictDetectionAlgorithm } = params;

	let nextTrailsState: Trail[] = [];

	if (trails.length === 0) {
		nextTrailsState = [new Trail(variables.nVariables())];
	} else {
		nextTrailsState = [...trails];
	}

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	variables.persist(assignment.variable, assignment.polarity);
	const variable = variables.getCopy(assignment.variable);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, 'Manual'));

	const literalToCheck: number = assignment.polarity ? -assignment.variable : assignment.variable;
	const clausesToCheck: Set<number> | undefined = mapping.get(literalToCheck);
	const { eval: newEval, end } = conflictDetectionAlgorithm({
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
}
