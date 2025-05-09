import type { ManualAssignment } from '$lib/components/debugger/events.svelte.ts';
import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';
import type { StepResult } from '../utils/types/algorithms.ts';

export interface ManualParams {
	assignment: ManualAssignment;
	trails: Trail[];
	variables: VariablePool;
	mapping: MappingLiteral2Clauses;
}

export function manualAssignment(params: ManualParams): StepResult {
	const { assignment, trails, variables, mapping } = params;

	const nextTrailsState: Trail[] =
		trails.length === 0 ? [new Trail(variables.nVariables())] : [...trails];

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	variables.persist(assignment.variable, assignment.polarity);
	const variable = variables.getCopy(assignment.variable);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, 'Manual'));

	const literalToCheck: number = assignment.polarity ? assignment.variable : -assignment.variable;

	let clausesToCheck = mapping.get(literalToCheck);
	if (!clausesToCheck) {
		clausesToCheck = new Set<number>();
	}

	return { clausesToCheck, trails: nextTrailsState };
}
