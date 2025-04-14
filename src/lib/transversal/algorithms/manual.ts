import type { ManualAssignment } from '$lib/components/tools/debugger/events.svelte.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.svelte.ts';

export interface ManualParams {
	assignment: ManualAssignment;
	trails: Trail[];
	variables: VariablePool;
}

export function manualAssignment(params: ManualParams): Trail[] {
	const { assignment, trails, variables } = params;

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

	return nextTrailsState;
}
