import Clause from '$lib/transversal/entities/Clause.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import Literal from '$lib/transversal/entities/Literal.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
import type { RawClause } from '$lib/transversal/utils/parsers/dimacs.ts';
import { rawClausesToClauses } from '$lib/transversal/utils/utils.ts';
import { describe, expect, it } from 'vitest';

const rawClauses: RawClause[] = [
	[1, 2, -3, 0],
	[-2, 3, 0]
];

const anotherClaim: number[] = [-1, -2, 0];

describe('clause pool', () => {
	it('unresolved', () => {
		Clause.resetUniqueIdGenerator();
		const variablePool: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(rawClausesToClauses(rawClauses, variablePool));
		variablePool.persist(1, true);
		expect(clausePool.eval()).toBe(Eval.UNRESOLVED);
	});
	it('unsat', () => {
		Clause.resetUniqueIdGenerator();
		const variablePool: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(rawClausesToClauses(rawClauses, variablePool));
		variablePool.persist(1, true);
		variablePool.persist(2, true);
		variablePool.persist(3, false);
		expect(clausePool.eval()).toBe(Eval.UNSAT);
	});
	it('sat', () => {
		Clause.resetUniqueIdGenerator();
		const variablePool: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(rawClausesToClauses(rawClauses, variablePool));
		variablePool.persist(1, true);
		variablePool.persist(2, false);
		variablePool.persist(3, true);
		expect(clausePool.eval()).toBe(Eval.SAT);
	});
	it('addition-sat', () => {
		Clause.resetUniqueIdGenerator();
		const variablePool: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(rawClausesToClauses(rawClauses, variablePool));
		const literalCollection: Literal[] = [];
		anotherClaim.forEach((value) => {
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
	it('addition-sat', () => {
		Clause.resetUniqueIdGenerator();
		const variablePool: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(rawClausesToClauses(rawClauses, variablePool));
		expect(clausePool.size()).toBe(2);
		const literals: Literal[] = [];
		anotherClaim.forEach((value) => {
			if (value !== 0) {
				literals.push(
					new Literal(variablePool.get(Math.abs(value)), value < 0 ? 'Negative' : 'Positive')
				);
			}
		});
		clausePool.addClause(new Clause(literals));
		expect(clausePool.size()).toBe(3);
		expect(Clause.nextUniqueId()).toBe(3);
	});
});
