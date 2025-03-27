import {
	dummyAssignmentAlgorithm,
	type DummySearchParams
} from '$lib/transversal/algorithms/dummy.ts';
import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
import VariableAssignment, { DecisionCause } from '$lib/transversal/entities/VariableAssignment.ts';
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
		expect(params.currentTrail.pop()?.getCause()).toBe(DecisionCause.AUTOMATED);
	});
	it('Manual Decision', () => {
		params.variablePool.dispose(3);
		params.variablePool.persist(3, false);
		params.currentTrail.push(
			VariableAssignment.createWithDecision(params.variablePool.getCopy(3), DecisionCause.MANUAL)
		);
		expect(params.currentTrail.pop()?.getCause()).toBe(DecisionCause.MANUAL);
		params.currentTrail.push(
			VariableAssignment.createWithDecision(params.variablePool.getCopy(3), DecisionCause.MANUAL)
		);
	});
	it('Backtracking', () => {
		dummyAssignmentAlgorithm(params);
		dummyAssignmentAlgorithm(params);
		expect(params.currentTrail.pop()?.isK()).toBe(true);
		params.currentTrail.push(
			VariableAssignment.createWithBacktracking(params.variablePool.getCopy(4))
		);
	});
	it('Unit Propagation baby',() => {
        dummyAssignmentAlgorithm(params);
        params.variablePool.dispose(4);
        params.variablePool.persist(4, false);
        //We do not have any clause but this should be okay for now
        params.currentTrail.push(VariableAssignment.createWithUP(params.variablePool.getCopy(4), 3));
        const lastDecision = params.currentTrail.pop();
        expect(lastDecision?.isUP()).toBe(true);
        expect(lastDecision?.getCause()).toBe(3);
    });
});
