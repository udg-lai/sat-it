import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { RawClause } from '$lib/transversal/mapping/contentToSummary.ts';
import { describe, expect, it } from 'vitest';

const rawClauses: RawClause[] = [[1, 2, -3, 0], [-2, 3, 0], []];

describe('unit clause', () => {
	it('1 unit clause', () => {
		const variablePool = new VariablePool(3);
		const clausePool = ClausePool.buildFrom(rawClauses, variablePool);
		variablePool.assign(3, false);
		expect(clausePool.getUnitClauses().size).toBe(1);
	});
	it('0 unit clause', () => {
		const variablePool = new VariablePool(3);
		const clausePool = ClausePool.buildFrom(rawClauses, variablePool);
		variablePool.assign(1, true);
		variablePool.assign(3, true);
		expect(clausePool.getUnitClauses().size).toBe(0);
	});
});
