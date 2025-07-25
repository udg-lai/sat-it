import ClausePool from '$lib/entities/ClausePool.svelte.ts';
import { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { isSAT, isUnresolved, isUnSAT } from '$lib/interfaces/IClausePool.ts';
import type { Summary } from '$lib/parsers/dimacs.ts';
import parseDimacs from '$lib/parsers/dimacs.ts';
import { describe, expect, it } from 'vitest';

const example01 = `
c
c
c start with comments
c
c adios
p cnf 3 2
1 2 -3 0
-2 3 0
`;

const summary01: Summary = parseDimacs(example01);

const example02 = `
c
c
c start with comments
c
c adios
p cnf 3 3
1 2 -3 0
-2 3 0
-1 -2 0
`;

const summary02: Summary = parseDimacs(example02);

describe('clause pool', () => {
	it('unresolved', () => {
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = ClausePool.buildFrom(summary01.claims, variables);
		variables.assign(1, true);
		const evaluation = clausePool.eval();
		expect(isUnresolved(evaluation)).toBe(true);
	});
	it('unsat', () => {
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = ClausePool.buildFrom(summary01.claims, variables);
		variables.assign(1, true);
		variables.assign(2, true);
		variables.assign(3, false);
		const evaluation = clausePool.eval();

		expect(isUnSAT(evaluation)).toBe(true);
	});
	it('sat', () => {
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = ClausePool.buildFrom(summary01.claims, variables);
		variables.assign(1, true);
		variables.assign(2, false);
		variables.assign(3, true);
		const evaluation = clausePool.eval();
		expect(isSAT(evaluation)).toBe(true);
	});
	it('addition-sat', () => {
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = ClausePool.buildFrom(summary02.claims, variables);
		variables.assign(1, true);
		variables.assign(2, false);
		variables.assign(3, true);
		const evaluation = clausePool.eval();
		expect(isSAT(evaluation)).toBe(true);
	});
	it('addition-sat', () => {
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = ClausePool.buildFrom(summary02.claims, variables);
		expect(clausePool.size()).toBe(3);
	});
});
