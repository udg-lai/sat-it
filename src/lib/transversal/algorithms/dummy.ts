import VariableAssignment, { DecisionCause } from '../entities/VariableAssignment.ts';
import type { Trail } from '../entities/Trail.svelte.ts';
import type { TrailCollection } from '../entities/TrailCollection.svelte.ts';
import type VariablePool from '../entities/VariablePool.ts';
import { logError } from '../utils/logging.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export interface DummySearchParams {
	otherTrails: TrailCollection;
	currentTrail: Trail;
	variablePool: VariablePool;
}

const algorithm = "dummyAssignment"

export function dummyAssignmentAlgorithm(params: DummySearchParams): void {
	const { otherTrails, currentTrail, variablePool } = params;

	if (!variablePool.allAssigned()) {
		const nextVariable = variablePool.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = fromJust(nextVariable);
			variablePool.persist(variableId, true);
			const variable = variablePool.getCopy(variableId);
			currentTrail.push(VariableAssignment.newAutomatedAssignment(variable, algorithm));
			currentTrail.updateFollowUpIndex();
		} else {
			logError('Dummy Search Algorithm', 'No variable to decide');
		}
	} else {
		otherTrails.push(currentTrail.copy());
		let backtrack = false;
		let lastDecision = currentTrail.pop();
		while (!backtrack && lastDecision !== undefined) {
			const lastVariable = lastDecision.getVariable();
			variablePool.dispose(lastVariable.getInt());
			if (lastDecision.isD()) {
				backtrack = true;
				variablePool.persist(lastVariable.getInt(), !lastVariable.getAssignment());
				const variable = variablePool.getCopy(lastVariable.getInt());
				currentTrail.push(VariableAssignment.newAssignmentBacktracking(variable));
				currentTrail.updateFollowUpIndex();
			} else {
				lastDecision = currentTrail.pop();
			}
		}
		if (!backtrack) {
			// this denotes that no backward decision was found in the trail
			currentTrail.updateFollowUpIndex();
		}
	}
}
