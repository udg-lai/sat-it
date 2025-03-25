import Clause from '$lib/transversal/entities/Clause.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import Literal from '$lib/transversal/entities/Literal.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import { Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
import type { Claims } from '$lib/transversal/utils/parsers/dimacs.ts';
import { fromClaimsToClause } from '$lib/transversal/utils/utils.ts';
import { describe, expect, it } from 'vitest';

const dummyExample: Claims = [
	[1, 2, -3, 0],
	[-2, 3, 0]
];

const extraClause: number[] = [-1, -2, 0];

const variablePool: VariablePool = new VariablePool(3);

describe('clause pool', () => {
	it('unresolved', () => {
		const clausePool: ClausePool = new ClausePool(fromClaimsToClause(dummyExample, variablePool));
		variablePool.persist(1, true);
		expect(clausePool.eval()).toBe(Eval.UNRESOLVED);
	});
	it('unsat', () => {
		const clausePool: ClausePool = new ClausePool(fromClaimsToClause(dummyExample, variablePool));
		variablePool.persist(1, true);
		variablePool.persist(2, true);
		variablePool.persist(3, false);
		expect(clausePool.eval()).toBe(Eval.UNSAT);
	});
	it('sat', () => {
		const clausePool: ClausePool = new ClausePool(fromClaimsToClause(dummyExample, variablePool));
		variablePool.persist(1, true);
		variablePool.persist(2, false);
		variablePool.persist(3, true);
		expect(clausePool.eval()).toBe(Eval.SAT);
	});
	it('addition-sat', () => {
		const clausePool: ClausePool = new ClausePool(fromClaimsToClause(dummyExample, variablePool));
		const literalCollection: Literal[] = [];
		extraClause.forEach((value) => {
			if (value !== 0) {
				literalCollection.push(
					new Literal(variablePool.get(Math.abs(value)), value < 0 ? 'Negative' : 'Positive')
				);
			}
			clausePool.addClause(new Clause(literalCollection));
		});
		variablePool.persist(1, true);
		variablePool.persist(2, false);
		variablePool.persist(3, true);
		expect(clausePool.eval()).toBe(Eval.SAT);
	});
});
