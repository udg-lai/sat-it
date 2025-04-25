import { literalToClauses, type AlgorithmReturn, type MappingLiteral2Clauses, type Problem } from "$lib/store/problem.store.ts";
import { backtrackingAlgorithm } from "$lib/transversal/algorithms/backtracking.ts";
import ClausePool from "$lib/transversal/entities/ClausePool.svelte.ts";
import type { Trail } from "$lib/transversal/entities/Trail.svelte.ts";
import VariablePool from "$lib/transversal/entities/VariablePool.svelte.ts";
import type { Unsat } from "$lib/transversal/utils/interfaces/IClausePool.ts";
import type { CNF } from "$lib/transversal/utils/parsers/dimacs.ts";
import { cnfToClauseSet } from "$lib/transversal/utils/utils.ts";
import { describe, expect, it } from "vitest";

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
  algorithm: backtrackingAlgorithm
}

let trails:Trail[] = [];

describe('backtracking algorithm', () => {
  it('First Assignment', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.end).toBe(false);
    expect(result.type.type).toBe('UNRESOLVED');
  })
  it('Second Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.end).toBe(false);
    expect(result.type.type).toBe('UNRESOLVED');
  })
  it('Third Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.end).toBe(false);
    expect(result.type.type).toBe('UNRESOLVED');
  })
  it('Fourth Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    const resultType = result.type as Unsat 
    expect(result.end).toBe(false);
    expect(resultType.type).toBe('UNSAT');
    expect(resultType.conflicClause).toBe(0);
  })
  it('Fifth Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.type.type).toBe('UNSAT');
    expect(result.end).toBe(false);
  })
  it('Sixth Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.type.type).toBe('SAT');
    expect(result.end).toBe(false);
  })
  it('Seventh Assignemnt', () => {
    const result: AlgorithmReturn = problem.algorithm({trails: trails, variables:problem.variables, clauses: problem.clauses});
    trails = result.trails;
    expect(result.type.type).toBe('SAT');
    expect(result.end).toBe(true);
  })
})
