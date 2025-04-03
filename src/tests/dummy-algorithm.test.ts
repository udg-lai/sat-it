import {
	algorithmName as dummyAlgorithmName,
	dummyAssignmentAlgorithm,
	type DummySearchParams
} from '$lib/transversal/algorithms/dummy.ts';
import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
import VariableAssignment, {
	isAutomatedAssignment,
	isManualAssignment
} from '$lib/transversal/entities/VariableAssignment.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import { describe, expect, it } from 'vitest';

const params: DummySearchParams = {
	otherTrails: new TrailCollection(),
	currentTrail: new Trail(4),
	variablePool: new VariablePool(4)
};

for (let i = 0; i < 3; i++) {
	dummyAssignmentAlgorithm(params);
}

describe('variable assignment', () => {
	it('Automated Decision', () => {
		const { currentTrail } = params;
		const lastAssignment = currentTrail.pop();
		expect(lastAssignment).not.toBe(undefined);
		if (lastAssignment) {
			const reason = lastAssignment.getReason();
			if (isAutomatedAssignment(reason)) {
				const { algorithm } = reason;
				expect(algorithm).toBe(dummyAlgorithmName);
			}
		}
	});
	it('Manual Decision', () => {
		const { currentTrail, variablePool } = params;

		variablePool.dispose(3);
		variablePool.persist(3, false);

		currentTrail.push(VariableAssignment.newManualAssignment(params.variablePool.getCopy(3)));
		const lastAssignment = currentTrail.pop();
		expect(lastAssignment).not.toBe(undefined);
		if (lastAssignment) {
			const reason = lastAssignment.getReason();
			const manualAssignment = isManualAssignment(reason);
			expect(manualAssignment).toBe(true);
		}
	});
	it('Backtracking', () => {
		for (let i = 0; i < 2; i++) {
			dummyAssignmentAlgorithm(params);
		}

		const { currentTrail } = params;
		const lastDecision = currentTrail.pop();

		expect(lastDecision?.isK()).toBe(true);
	});
});
