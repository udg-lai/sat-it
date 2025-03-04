import DecisionVariable, { AssignmentReason } from '../entities/DecisionLiteral.svelte.ts';
import type { Trail } from '../entities/Trail.svelte.ts';
import type { TrailCollection } from '../entities/TrailCollection.svelte.ts';
import type { IVariablePool } from '../utils/interfaces/IVariablePool.ts';
import { isJust, unwrapMaybe } from '../utils/types/maybe.ts';

export default function decide(trailCollection: TrailCollection,trail: Trail,pool: IVariablePool): void {
	if (!pool.allAssigned()) {
		const nextVariable = pool.nextVariableToAssign();
		if (isJust(nextVariable)) {
			const variableId = unwrapMaybe(nextVariable);
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
			const lastVariableId = lastDecision.getVariable().getInt();
			pool.dispose(lastVariableId);
			if (lastDecision.isD()) {
				backtrack = true;
				pool.persist(lastVariableId, !lastDecision.getVariable().getAssignment);
				const variable = pool.get(lastVariableId);
				const dVariable = new DecisionVariable(variable, AssignmentReason.K);
				trail.push(dVariable);
				trail.updateFollowUpIndex();
			} else {
				lastDecision = trail.pop();
			}
		}
		if(!backtrack) {
			trail.updateFollowUpIndex();
		}
	}
}
