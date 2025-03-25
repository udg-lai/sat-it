import DecisionVariable, { AssignmentReason } from '../entities/DecisionLiteral.svelte.ts';
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

export function dummySearch(params: DummySearchParams): void {
	const { otherTrails, currentTrail, variablePool } = params;

	if (!variablePool.allAssigned()) {
		const nextVariable = variablePool.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = fromJust(nextVariable);
			variablePool.persist(variableId, true);
			const variable = variablePool.get(variableId);
			const dVariable = new DecisionVariable(variable, AssignmentReason.D);
			currentTrail.push(dVariable);
			currentTrail.updateFollowUpIndex()
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
				variablePool.persist(lastVariable.getInt(), !fromJust(lastVariable.getAssignment()));
				const variable = variablePool.get(lastVariable.getInt());
				const dVariable = new DecisionVariable(variable, AssignmentReason.K);
				currentTrail.push(dVariable);
			} else {
				lastDecision = currentTrail.pop();
			}
		}
		if (!backtrack) {
			currentTrail.updateFollowUpIndex();
		}
	}
}
