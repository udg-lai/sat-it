import Clause from '$lib/transversal/entities/Clause.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import Literal from '$lib/transversal/entities/Literal.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { isSat, isUnresolved, isUnsat } from '$lib/transversal/utils/interfaces/IClausePool.ts';
import type { CNF } from '$lib/transversal/utils/parsers/dimacs.ts';
import { cnfToClauseSet } from '$lib/transversal/utils/utils.ts';
import { describe, expect, it } from 'vitest';

const cnf: CNF = [
	[1, 2, -3],
	[-2, 3]
];

const clause: number[] = [-1, -2];

describe('clause pool', () => {
	it('unresolved', () => {
		Clause.resetUniqueIdGenerator();
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
		variables.persist(1, true);
		const evaluation = clausePool.eval();
		expect(isUnresolved(evaluation)).toBe(true);
	});
	it('unsat', () => {
		Clause.resetUniqueIdGenerator();
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
		variables.persist(1, true);
		variables.persist(2, true);
		variables.persist(3, false);
		const evaluation = clausePool.eval();

		expect(isUnsat(evaluation)).toBe(true);
	});
	it('sat', () => {
		Clause.resetUniqueIdGenerator();
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
		variables.persist(1, true);
		variables.persist(2, false);
		variables.persist(3, true);
		const evaluation = clausePool.eval()
		expect(isSat(evaluation)).toBe(true);
	});
	it('addition-sat', () => {
		Clause.resetUniqueIdGenerator();
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
		const literalCollection: Literal[] = [];
		clause.forEach((value) => {
			if (value !== 0) {
				literalCollection.push(
					new Literal(variables.get(Math.abs(value)), value < 0 ? 'Negative' : 'Positive')
				);
			}
			clausePool.addClause(new Clause(literalCollection));
		});
		variables.persist(1, true);
		variables.persist(2, false);
		variables.persist(3, true);
		const evaluation = clausePool.eval()
		expect(isSat(evaluation)).toBe(true);
	});
	it('addition-sat', () => {
		Clause.resetUniqueIdGenerator();
		const variables: VariablePool = new VariablePool(3);
		const clausePool: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
		expect(clausePool.size()).toBe(2);
		const literals: Literal[] = [];
		clause.forEach((value) => {
			if (value !== 0) {
				literals.push(
					new Literal(variables.get(Math.abs(value)), value < 0 ? 'Negative' : 'Positive')
				);
			}
		});
		clausePool.addClause(new Clause(literals));
		expect(clausePool.size()).toBe(3);
		expect(Clause.nextUniqueId()).toBe(3);
	});
});
