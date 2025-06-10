import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type Clause from '$lib/transversal/entities/Clause.ts';
import { getDefaultClauses, setDefaultClauses } from './clause-pool.svelte.ts';

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
	setDefaultClauses(clausePool.getClauses());
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

	//Reset the variables
	variables.reset();
	trail.forEach((value) => {
		const variable = value.getVariable();
		variables.persist(variable.getInt(), variable.getAssignment());
	});

	//Reset the caluses
	const defaultClauses: Clause[] = getDefaultClauses();
	const learnedClauses: Clause[] = trail.learnedClauses();
	const clauses: ClausePool = new ClausePool([...defaultClauses, ...learnedClauses]);

	//Reset the mapping
	const mapping: MappingLiteral2Clauses = literalToClauses(clauses);

	problemStore = { ...currentProblem, variables, clauses, mapping };
}

export function resetProblem() {
	const problem: Problem = problemStore;
	problem.variables.reset();
	problemStore = { ...problem };
}

export function addClauseToClausePool(clause: Clause) {
	const { clauses, ...currentProblem } = problemStore;
	clauses.addClause(clause);

	//Reset the mapping
	const mapping: MappingLiteral2Clauses = literalToClauses(clauses);

	problemStore = { ...currentProblem, clauses, mapping };
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
