import {
	algorithmName as dummyAlgorithmName,
	dummyAssignmentAlgorithm,
	type DummySearchParams
} from '$lib/transversal/algorithms/dummy.ts';
import VariableAssignment, {
	isAutomatedAssignment,
	isManualAssignment
} from '$lib/transversal/entities/VariableAssignment.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
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
			const assignmentKind = lastAssignment.getAssignmentKind();
			if (isAutomatedAssignment(assignmentKind)) {
				const { algorithm } = assignmentKind;
				expect(algorithm).toBe(dummyAlgorithmName);
			}
		}
	});
	it('Manual Decision', () => {
		const { trails, variables } = params;
		variables.dispose(3);
		variables.persist(3, false);

		trails[trails.length - 1].push(
			VariableAssignment.newManualAssignment(params.variables.getCopy(3))
		);
		const lastAssignment = trails[trails.length - 1].pop();
		expect(lastAssignment).not.toBe(undefined);
		if (lastAssignment) {
			const assignmentKind = lastAssignment.getAssignmentKind();
			const manualAssignment = isManualAssignment(assignmentKind);
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
