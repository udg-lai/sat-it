import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import Clause from '$lib/entities/Clause.svelte.ts';
import ClausePool from '$lib/entities/ClausePool.svelte.ts';
import TemporalClause from '$lib/entities/TemporalClause.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type Variable from '$lib/entities/Variable.svelte.ts';
import { VariablePool } from '$lib/entities/VariablePool.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { getDefaultClauses, setDefaultClauses } from './clause-pool.svelte.ts';
import { getTrails } from './trails.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';

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
	trail.forEach((assignment) => {
		const variable: Variable = assignment.getVariable();
		variables.assign(variable.getInt(), variable.getAssignment());
	});

	//Reset the clauses
	const clauses: ClausePool = new ClausePool(obtainProblemClauses());

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

export function forgetClause(lemma: Clause) {
	const { clauses, ...currentProblem } = problemStore;

	//Remove clause from the pool
	clauses.removeClause(lemma);

	//remove clause from mapping
	const mapping: MappingLiteral2Clauses = problemStore.mapping;
	removeClauseFromMapping(lemma, lemma.getTag(), mapping);

	problemStore = { ...currentProblem, clauses, mapping };
}

function literalToClauses(clauses: ClausePool): MappingLiteral2Clauses {
	const mapping: Map<number, SvelteSet<number>> = new Map();

	clauses.getClauses().forEach((clause, clauseId) => {
		addClauseToMapping(clause, clauseId, mapping);
	});

	return mapping;
}

const addClauseToMapping = (clause: Clause, clauseId: number, mapping: MappingLiteral2Clauses) => {
	clause.getLiterals().forEach((literal) => {
		const literalId = literal.toInt();
		if (mapping.has(literalId)) {
			const s = mapping.get(literalId);
			s?.add(clauseId);
		} else {
			const s = new SvelteSet([clauseId]);
			mapping.set(literalId, s);
		}
	});
};

const removeClauseFromMapping = (clause: Clause, clauseId: number, mapping: MappingLiteral2Clauses) => {
	clause.getLiterals().forEach((literal) => {
		const literalId = literal.toInt();
		if (mapping.has(literalId)) {
			const s = mapping.get(literalId);
			s?.delete(clauseId);
		} else {
			logFatal("Forget Clause Error", `The literal ${literalId} does not exist in the mapping`);
		}
	});
}

const obtainProblemClauses = (): Clause[] => {
	//Get all the clauses from the problem
	const defaultClauses: TemporalClause[] = getDefaultClauses();
	const learnedClauses: TemporalClause[] = [];
	for (const trail of getTrails()) {
		const learnedClause: Clause | undefined = trail.getLearnedClause();
		if (learnedClause !== undefined) learnedClauses.push(new TemporalClause(learnedClause.getLiterals()));
	}
	const problemUnindexedClauses: TemporalClause[] = [...defaultClauses, ...learnedClauses];

	//Generate the clause pool clauses
	const problemClauses: Clause[] = [];
	for (const uClause of problemUnindexedClauses) {
		problemClauses.push(new Clause(uClause.getLiterals()));
	}
	return problemClauses;
};

export const getProblemStore = () => problemStore;

export const getClausePool = () => problemStore.clauses;
