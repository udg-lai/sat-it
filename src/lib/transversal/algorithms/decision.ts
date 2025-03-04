import DecisionVariable, { AssignmentReason } from '../entities/DecisionLiteral.svelte.ts';
import type { Trail } from '../entities/Trail.svelte.ts';
import type { TrailCollection } from '../entities/TrailCollection.svelte.ts';
import type { IVariablePool } from '../utils/interfaces/IVariablePool.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';

export default function decide(
	trailCollection: TrailCollection,
	trail: Trail,
	pool: IVariablePool
): void {
	if (!pool.allAssigned()) {
		const nextVariable = pool.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = fromJust(nextVariable);
			pool.persist(variableId, true);
			const variable = pool.get(variableId);
			const dVariable = new DecisionVariable(variable, AssignmentReason.D);
			trail.push(dVariable);
		} else {
			throw '[Error]: No variables to decide';
		}
	} else {
		trailCollection.push(trail.copy());
		let backtrack = false;
		let lastDecision = trail.pop();
		while (!backtrack && lastDecision !== undefined) {
			const lastVariable = lastDecision.getVariable();
			pool.dispose(lastVariable.getInt());
			if (lastDecision.isD()) {
				backtrack = true;
				pool.persist(lastVariable.getInt(), !fromJust(lastVariable.getAssignment()));
				const variable = pool.get(lastVariable.getInt());
				const dVariable = new DecisionVariable(variable, AssignmentReason.K);
				trail.push(dVariable);
				trail.updateFollowUpIndex();
			} else {
				lastDecision = trail.pop();
			}
		}
		if (!backtrack) {
			trail.updateFollowUpIndex();
		}
	}
}
