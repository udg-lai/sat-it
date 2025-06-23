import {
	algorithmName as dummyAlgorithmName,
	dummyAssignmentAlgorithm,
	type DummySearchParams
} from '$lib/algorithms/dummy.ts';
import VariableAssignment, {
	isAutomatedReason,
	isManualReason
} from '$lib/entities/VariableAssignment.ts';
import { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { describe, expect, it } from 'vitest';

const params: DummySearchParams = {
	trails: [],
	variables: new VariablePool(4)
};

for (let i = 0; i < 3; i++) {
	params.trails = dummyAssignmentAlgorithm(params);
}

describe('variable assignment', () => {
	it('Automated Decision', () => {
		const { trails } = params;
		const lastAssignment = trails[trails.length - 1].pop();
		expect(lastAssignment).not.toBe(undefined);
		if (lastAssignment) {
			const reason = lastAssignment.getReason();
			if (isAutomatedReason(reason)) {
				const { algorithm } = reason;
				expect(algorithm).toBe(dummyAlgorithmName);
			}
		}
	});
	it('Manual Decision', () => {
		const { trails, variables } = params;
		variables.assign(3, false);

		trails[trails.length - 1].push(
			VariableAssignment.newManualAssignment(params.variables.getVariableCopy(3))
		);
		const lastAssignment = trails[trails.length - 1].pop();
		expect(lastAssignment).not.toBe(undefined);
		if (lastAssignment) {
			const reason = lastAssignment.getReason();
			const manualAssignment = isManualReason(reason);
			expect(manualAssignment).toBe(true);
		}
	});
	it('Backtracking', () => {
		for (let i = 0; i < 2; i++) {
			params.trails = dummyAssignmentAlgorithm(params);
		}

		const { trails } = params;
		const lastDecision = trails[trails.length - 1].pop();

		expect(lastDecision?.isK()).toBe(true);
	});
});
