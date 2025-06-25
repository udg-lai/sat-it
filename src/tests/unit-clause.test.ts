import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { Summary } from '$lib/transversal/parsers/dimacs.ts';
import parseDimacs from '$lib/transversal/parsers/dimacs.ts';
import { describe, expect, it } from 'vitest';

const example01 = `
c start with comments
p cnf 5 3
1 2 -3 0
-2 3 0
0
`;

const summary: Summary = parseDimacs(example01);

describe('unit clause', () => {
	it('1 unit clause', () => {
		const variablePool = new VariablePool(3);
		const clausePool = ClausePool.buildFrom(summary.claims, variablePool);
		variablePool.assign(3, false);
		expect(clausePool.getUnitClauses().size).toBe(1);
	});
	it('0 unit clause', () => {
		const variablePool = new VariablePool(3);
		const clausePool = ClausePool.buildFrom(summary.claims, variablePool);
		variablePool.assign(1, true);
		variablePool.assign(3, true);
		expect(clausePool.getUnitClauses().size).toBe(0);
	});
});
