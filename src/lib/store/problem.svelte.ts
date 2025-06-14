import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import type Variable from '$lib/transversal/entities/Variable.svelte.ts';

export type MappingLiteral2Clauses = Map<number, Set<number>>;

export type Algorithm = 'backtracking' | 'dpll' | 'cdcl';

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	algorithm: Algorithm;
}

let problemStore: Problem = $state({
	variables: new VariablePool(0),
	clauses: new ClausePool(),
	mapping: new Map<number, Set<number>>(),
	algorithm: 'backtracking'
});

export function updateProblemDomain(instance: DimacsInstance) {
	const { varCount, cnf: clauses } = instance.summary;

	const variablePool: VariablePool = new VariablePool(varCount);
	const clausePool: ClausePool = ClausePool.buildFrom(clauses, variablePool);
	const mapping: MappingLiteral2Clauses = literalToClauses(clausePool);

	const params = {
		variables: variablePool,
		clauses: clausePool,
		mapping
	};

	const { algorithm } = problemStore;
	const newProblem: Problem = {
		...params,
		algorithm
	};

	problemStore = newProblem;
}

export function updateAlgorithm(algorithm: Algorithm) {
	const currentProblem = problemStore;
	currentProblem.variables.reset();
	problemStore = { ...currentProblem, algorithm };
}

export function updateProblemFromTrail(trail: Trail) {
	const { variables, ...currentProblem } = problemStore;
	variables.reset();
	trail.forEach(assignment => {
		const variable: Variable = assignment.getVariable();
		variables.assign(variable.getInt(), variable.getAssignment());
	});
	problemStore = { ...currentProblem, variables };
}

export function resetProblem() {
	const problem: Problem = problemStore;
	problem.variables.reset();
	problemStore = { ...problem };
}

function literalToClauses(clauses: ClausePool): MappingLiteral2Clauses {
	const mapping: Map<number, Set<number>> = new Map();

	clauses.getClauses().forEach((clause, clauseId) => {
		clause.getLiterals().forEach((literal) => {
			const literalId = literal.toInt();
			if (mapping.has(literalId)) {
				const s = mapping.get(literalId);
				s?.add(clauseId);
			} else {
				const s = new Set([clauseId]);
				mapping.set(literalId, s);
			}
		});
	});
	return mapping;
}

export const getProblemStore = () => problemStore;
