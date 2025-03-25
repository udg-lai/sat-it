import DecisionVariable, { AssignmentReason } from '../entities/DecisionLiteral.svelte.ts';
import {
	makeForwardDecision,
	makeRollbackDecision,
	type Decision,
	type Trail
} from '../entities/Trail.svelte.ts';
import type { TrailCollection } from '../entities/TrailCollection.svelte.ts';
import type Variable from '../entities/Variable.svelte.ts';
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
			const forwardDecision = makeForwardDecision(dVariable);
			currentTrail.push(forwardDecision);
			currentTrail.updateFollowUpIndex();
		} else {
			logError('Dummy Search Algorithm', 'No variable to decide');
		}
	} else {
		otherTrails.push(currentTrail.copy());
		let backtrack = false;
		let lastDecision: Decision | undefined = currentTrail.pop();
		while (!backtrack && lastDecision !== undefined) {
			const lastDecisionVariable: DecisionVariable = lastDecision.decision;
			const lastVariable: Variable = lastDecisionVariable.getVariable();
			const lastVariableId: number = lastVariable.getInt();
			const lastVariableAssignment: boolean = fromJust(lastVariable.getAssignment());
			variablePool.dispose(lastVariableId);
			if (lastDecision.type === 'Forward') {
				backtrack = true;
				variablePool.persist(lastVariableId, !lastVariableAssignment);
				const variable = variablePool.get(lastVariable.getInt());
				const dVariable = new DecisionVariable(variable, AssignmentReason.K);
				const rollbackDecision = makeRollbackDecision(dVariable);
				currentTrail.push(rollbackDecision);
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
