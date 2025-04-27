import {
	literalToClauses,
	type MappingLiteral2Clauses,
	type Problem
} from '$lib/store/problem.store.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import {
	isSat,
	isUnresolved,
	isUnsat,
	makeUnresolved
} from '$lib/transversal/utils/interfaces/IClausePool.ts';
import type { CNF } from '$lib/transversal/utils/parsers/dimacs.ts';
import {
	backtracking,
	type AlgorithmParams,
	type AssignmentResult
} from '$lib/transversal/utils/types/algorithm.ts';
import { cnfToClauseSet } from '$lib/transversal/utils/utils.ts';
import { describe, expect, it } from 'vitest';

const cnf: CNF = [
	[-1, -2, -3],
	[-2, 3]
];

const variables: VariablePool = new VariablePool(3);
const clauses: ClausePool = new ClausePool(cnfToClauseSet(cnf, variables));
const mapping: MappingLiteral2Clauses = literalToClauses(clauses);

const problem: Problem = {
	variables,
	clauses,
	mapping,
	algorithm: backtracking
};

const params: AlgorithmParams = {
	variables: problem.variables,
	clauses: problem.clauses,
	mapping: mapping,
	trails: [],
	previousEval: makeUnresolved()
};

describe('backtracking algorithm', () => {
	it('First Assignment', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(result.end).toBe(false);
		expect(isUnresolved(params.previousEval)).toBe(true);
	});
	it('Second Assignemnt', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(result.end).toBe(false);
		expect(isUnresolved(params.previousEval)).toBe(true);
	});
	it('Third Assignemnt', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(isUnsat(params.previousEval)).toBe(true);
		if (isUnsat(params.previousEval)) {
			expect(result.end).toBe(false);
			expect(params.previousEval.conflictClause).toBe(0);
		}
	});
	it('Fourth Assignemnt', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(isUnsat(params.previousEval)).toBe(true);
		expect(result.end).toBe(false);
	});
	it('Fifth Assignemnt', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(isUnresolved(params.previousEval)).toBe(true);
		expect(result.end).toBe(false);
	});
	it('Sixth Assignemnt', () => {
		const result: AssignmentResult = problem.algorithm.step(params);
		params.trails = result.trails;
		params.previousEval = result.eval;
		expect(isSat(params.previousEval)).toBe(true);
		expect(result.end).toBe(true);
	});
});
