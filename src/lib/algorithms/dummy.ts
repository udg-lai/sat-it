import { Trail } from '$lib/entities/Trail.svelte.ts';
import VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { fromJust, isJust } from '$lib/types/maybe.ts';

export interface DummySearchParams {
	trails: Trail[];
	variables: VariablePool;
}

export const algorithmName = 'dummyAssignment';

type StepAlgorithm = (params: DummySearchParams) => Trail[];

export const dummyAssignmentAlgorithm: StepAlgorithm = (params: DummySearchParams): Trail[] => {
	const { trails, variables } = params;

	let nextTrailsState: Trail[] = [];

	if (trails.length === 0) {
		nextTrailsState = [new Trail(variables.size())];
	} else {
		nextTrailsState = [...trails];
	}

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	if (!variables.allAssigned()) {
		const nextVariable = variables.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = fromJust(nextVariable);
			variables.assign(variableId, true);
			const variable = variables.getVariableCopy(variableId);
			workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithmName));
		} else {
			logFatal('Dummy Search Algorithm', 'No variable to decide');
		}
	} else {
		let backtrack = false;
		const copyWorkingTrail = workingTrail.copy();
		let lastDecision: VariableAssignment | undefined = copyWorkingTrail.pop();
		while (!backtrack && lastDecision !== undefined) {
			const lastVariable = lastDecision.getVariable();
			if (lastDecision.isD()) {
				backtrack = true;
				variables.assign(lastVariable.getInt(), !lastVariable.getAssignment());
				const variable = variables.getVariableCopy(lastVariable.getInt());
				copyWorkingTrail.push(VariableAssignment.newBacktrackingAssignment(variable));
				copyWorkingTrail.setFollowUpIndex();
			} else {
				lastDecision = copyWorkingTrail.pop();
			}
		}
		if (lastDecision === undefined) {
			// this denotes that no backward decision was found in the trail
			copyWorkingTrail.setFollowUpIndex();
		}
		nextTrailsState.push(copyWorkingTrail);
	}
	return nextTrailsState;
};
