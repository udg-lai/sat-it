import DecisionVariable, { AssignmentReason } from '../entities/DecisionLiteral.svelte.ts';
import type { Trail } from '../entities/Trail.svelte.ts';
import type { TrailCollection } from '../entities/TrailCollection.svelte.ts';
import type { IVariablePool } from '../utils/interfaces/IVariablePool.ts';
import { fromJust, isJust } from '../utils/types/maybe.ts';
import { pool } from '$lib/store.ts';

export default function decide(
	trailCollection: TrailCollection,
	trail: Trail,
): void {
	pool.update((currentPool) => {
		if (!currentPool.allAssigned()) {
			const nextVariable = currentPool.nextVariableToAssign();
			if (isJust(nextVariable)) {
				const variableId = fromJust(nextVariable);
				currentPool.persist(variableId, true);
				const variable = currentPool.get(variableId);
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
				currentPool.dispose(lastVariable.getInt());
				if (lastDecision.isD()) {
					backtrack = true;
					currentPool.persist(lastVariable.getInt(), !fromJust(lastVariable.getAssignment()));
					const variable = currentPool.get(lastVariable.getInt());
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
		console.log(currentPool);
		return currentPool
	});
}
