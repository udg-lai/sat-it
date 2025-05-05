import WipVariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { fromJust, isJust } from '$lib/transversal/types/maybe.ts';
import { describe, it, expect } from 'vitest';

describe('variable pool', () => {
	it('all assigned', () => {
		const capacity = 4;
		const pool = new WipVariablePool(capacity);
		for (let i = 0; i < capacity; i++) {
			if (!pool.allAssigned()) {
				const variableId = pool.nextVariableToAssign();
				if (isJust(variableId)) {
					pool.persist(fromJust(variableId), true);
				} else {
					throw new Error('All variables are assigned');
				}
			}
		}
		expect(pool.allAssigned()).toBe(true);
	});
	it('not all assigned', () => {
		const capacity = 4;
		const pool = new WipVariablePool(capacity);
		for (let i = 0; i < capacity - 1; i++) {
			if (!pool.allAssigned()) {
				const variableId = pool.nextVariableToAssign();
				if (isJust(variableId)) {
					pool.persist(fromJust(variableId), true);
				} else {
					throw new Error('All variables are assigned');
				}
			}
		}
		expect(pool.allAssigned()).toBe(false);
	});
	it('variable pool state', () => {
		const capacity = 4;
		const pool = new WipVariablePool(capacity);
		for (let i = 0; i < capacity - 1; i++) {
			if (!pool.allAssigned()) {
				const variableId = pool.nextVariableToAssign();
				if (isJust(variableId)) {
					pool.persist(fromJust(variableId), true);
				} else {
					throw new Error('All variables are assigned');
				}
			}
		}
		for (let i = 0; i < capacity - 1; i++) {
			const variable = pool.getCopy(i + 1);
			expect(variable.isAssigned()).toBe(true);
		}
		const variable = pool.getCopy(4);
		expect(variable.isAssigned()).toBe(false);
		let nextVariable = pool.nextVariableToAssign();
		expect(isJust(nextVariable)).toBe(true);
		if (isJust(nextVariable)) {
			pool.persist(fromJust(nextVariable), false);
		}
		nextVariable = pool.nextVariableToAssign();
		expect(isJust(nextVariable)).toBe(false);
	});
});
