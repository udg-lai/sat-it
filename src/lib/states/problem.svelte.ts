import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import Clause from '$lib/entities/Clause.svelte.ts';
import ClausePool from '$lib/entities/ClausePool.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type Variable from '$lib/entities/Variable.svelte.ts';
import { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { getTrails } from './trails.svelte.ts';

export type MappingLiteral2Clauses = Map<number, SvelteSet<number>>;

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
	mapping: new Map<number, SvelteSet<number>>(),
	algorithm: 'backtracking'
});

export function updateProblemDomain(instance: DimacsInstance) {
	const { varCount, claims } = instance.summary;

	const variablePool: VariablePool = new VariablePool(varCount);
	const clausePool: ClausePool = ClausePool.buildFrom(claims, variablePool);
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
	const { variables, clauses, ...currentProblem } = problemStore;

	//Reset the variables
	variables.reset();
	trail.forEach((assignment) => {
		const variable: Variable = assignment.getVariable();
		variables.assign(variable.getInt(), variable.getAssignment());
	});

	//FIX: This was causing some problems. What we have to do is as it follows. If not, the learned clauses where not erasing once an "undo" was done.
	const newLearnedClauses: Clause[] = [];
	getTrails().forEach((trail) => {
		const learntClause = trail.getLearntClause();
		if (learntClause !== undefined) {
			newLearnedClauses.push(learntClause);
		}
	});
	//Now we need to relearn the clauses
	clauses.clearLearnt();

	//Then we get the trails and learn their clauses
	newLearnedClauses.forEach((clause) => {
		clauses.addClause(clause);
	});

	//Reset the mapping
	const mapping: MappingLiteral2Clauses = literalToClauses(clauses);

	problemStore = { ...currentProblem, variables, clauses, mapping };
}

export function resetProblem() {
	const { variables, clauses, algorithm }: Problem = problemStore;

	variables.reset();
	clauses.clearLearnt();

	const mapping: MappingLiteral2Clauses = literalToClauses(clauses);

	problemStore = { variables, clauses, mapping, algorithm };
}

export function addClauseToClausePool(lemma: Clause) {
	const { clauses, ...currentProblem } = problemStore;
	clauses.addClause(lemma);

	//Add clause to mapping
	const mapping: MappingLiteral2Clauses = problemStore.mapping;
	addClauseToMapping(lemma, lemma.getTag(), mapping);

	problemStore = { ...currentProblem, clauses, mapping };
}

function literalToClauses(clauses: ClausePool): MappingLiteral2Clauses {
	const mapping: Map<number, SvelteSet<number>> = new Map();

	clauses.getClauses().forEach((clause, clauseTag) => {
		addClauseToMapping(clause, clauseTag, mapping);
	});

	return mapping;
}

const addClauseToMapping = (clause: Clause, clauseTag: number, mapping: MappingLiteral2Clauses) => {
	clause.getLiterals().forEach((literal) => {
		const literalId = literal.toInt();
		if (mapping.has(literalId)) {
			const s = mapping.get(literalId);
			s?.add(clauseTag);
		} else {
			const s = new SvelteSet([clauseTag]);
			mapping.set(literalId, s);
		}
	});
};

export const getProblemStore = () => problemStore;

export const getClausePool = () => problemStore.clauses;
