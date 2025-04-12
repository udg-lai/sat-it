import type { Manual } from '$lib/components/tools/debugger/events.svelte.ts';
import { updateNonAssignedVariables } from '$lib/store/debugger.store.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import VariableAssignment from '../entities/VariableAssignment.ts';
import type VariablePool from '../entities/VariablePool.ts';

export interface ManualParams {
	assignemnt: Manual;
	trails: Trail[];
	variables: VariablePool;
}

export function manualAssignment(params: ManualParams): Trail[] {
	const { assignemnt, trails, variables } = params;

	let nextTrailsState: Trail[] = [];

	if (trails.length === 0) {
		nextTrailsState = [new Trail(variables.nVariables())];
	} else {
		nextTrailsState = [...trails];
	}

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	variables.persist(assignemnt.variable, assignemnt.polarity);
	const variable = variables.getCopy(assignemnt.variable);
	workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, 'Manual'));

	updateNonAssignedVariables(true, assignemnt.variable);
	return nextTrailsState;
}
