import VariableAssignment from '../entities/VariableAssignment.ts';
import { Trail } from '../entities/Trail.svelte.ts';
import type VariablePool from '../entities/VariablePool.ts';
import { logFatal } from '../utils/logging.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';
import { updateNonAssignedVariables } from '$lib/store/debugger.store.ts';

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
		nextTrailsState = [new Trail(variables.nVariables())];
	} else {
		nextTrailsState = [...trails];
	}

	const workingTrail = nextTrailsState[nextTrailsState.length - 1];

	if (!variables.allAssigned()) {
		const nextVariable = variables.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = fromJust(nextVariable);
			variables.persist(variableId, true);
			const variable = variables.getCopy(variableId);
			workingTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithmName));
			updateNonAssignedVariables(true, variableId);
		} else {
			logFatal('Dummy Search Algorithm', 'No variable to decide');
		}
	} else {
		let backtrack = false;
		const copyWorkingTrail = workingTrail.copy();
		let lastDecision: VariableAssignment | undefined = copyWorkingTrail.pop();
		while (!backtrack && lastDecision !== undefined) {
			const lastVariable = lastDecision.getVariable();
			variables.dispose(lastVariable.getInt());
			updateNonAssignedVariables(false, lastVariable.getInt());
			if (lastDecision.isD()) {
				backtrack = true;
				variables.persist(lastVariable.getInt(), !lastVariable.getAssignment());
				const variable = variables.getCopy(lastVariable.getInt());
				copyWorkingTrail.push(VariableAssignment.newBacktrackingAssignment(variable));
				copyWorkingTrail.updateFollowUpIndex();
				updateNonAssignedVariables(true, lastVariable.getInt());
			} else {
				lastDecision = copyWorkingTrail.pop();
			}
		}
		if (lastDecision === undefined) {
			// this denotes that no backward decision was found in the trail
			copyWorkingTrail.updateFollowUpIndex();
		}
		nextTrailsState.push(copyWorkingTrail);
	}
	return nextTrailsState;
};
