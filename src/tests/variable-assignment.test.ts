import {
	dummyAssignmentAlgorithm,
	type DummySearchParams
} from '$lib/transversal/algorithms/dummy.ts';
import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
import VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import { describe, expect, it } from 'vitest';
const params: DummySearchParams = {
	otherTrails: new TrailCollection(),
	currentTrail: new Trail(4),
	variablePool: new VariablePool(4)
};
dummyAssignmentAlgorithm(params);
dummyAssignmentAlgorithm(params);
dummyAssignmentAlgorithm(params);

describe('variable assignment', () => {
	it('Automated Decision', () => {
		const lastReason = params.currentTrail.pop()?.getReason();
		console.log(lastReason);
		if (lastReason && typeof lastReason === 'object' && 'algorithm' in lastReason) {
			expect(lastReason.algorithm).toBe('dummyAssignment');
		} else {
			expect(lastReason).toBe('dummyAssignment');
		}
	});
	it('Manual Decision', () => {
		params.variablePool.dispose(3);
		params.variablePool.persist(3, false);
		params.currentTrail.push(
			VariableAssignment.newDecisionAssignment(params.variablePool.getCopy(3), 'Manual')
		);
		expect(params.currentTrail.pop()?.getReason()).toBe('Manual');
		params.currentTrail.push(
			VariableAssignment.newDecisionAssignment(params.variablePool.getCopy(3), 'Manual')
		);
	});
	it('Backtracking', () => {
		dummyAssignmentAlgorithm(params);
		dummyAssignmentAlgorithm(params);
		const lastDecision = params.currentTrail.pop();
		expect(lastDecision?.isK()).toBe(true);
		expect(typeof lastDecision?.getReason()).toBe('undefined');
		params.currentTrail.push(
			VariableAssignment.newAssignmentBacktracking(params.variablePool.getCopy(4))
		);
	});
	it('Unit Propagation baby', () => {
		dummyAssignmentAlgorithm(params);
		params.variablePool.dispose(4);
		params.variablePool.persist(4, false);
		//We do not have any clause but this should be okay for now
		params.currentTrail.push(VariableAssignment.newUPAssignment(params.variablePool.getCopy(4), 3));
		const lastDecision = params.currentTrail.pop();
		expect(lastDecision?.isUP()).toBe(true);
		expect(lastDecision?.getReason()).toBe(3);
	});
});
