import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type { Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
import { backtrackingAlgorithm } from '$lib/transversal/algorithms/backtracking.ts';

export type MappingLiteral2Clauses = Map<number, Set<number>>;

export interface AlgorithmParams {
	trails: Trail[];
	variables: VariablePool;
	clauses: ClausePool;
}

export type AlgorithmReturn = {
	type: Eval;
	end: boolean;
	trails: Trail[];
};

export type AlgorithmStep = (params: AlgorithmParams) => AlgorithmReturn;

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	algorithm: AlgorithmStep;
}

export const problemStore: Writable<Problem> = writable();
export const finsihed: Writable<boolean> = writable(false);

export function updateProblemDomain(instance: DimacsInstance) {
	const { varCount, cnf: clauses } = instance.summary;

	const variablePool: VariablePool = new VariablePool(varCount);
	const clausePool: ClausePool = ClausePool.buildFrom(clauses, variablePool);
	const mapping: MappingLiteral2Clauses = literalToClauses(clausePool);

	const previousProblem = get(problemStore);

	const params = {
		variables: variablePool,
		clauses: clausePool,
		mapping
	};

	let newProblem: Problem;

	if (previousProblem === undefined) {
		const algorithm = backtrackingAlgorithm;
		newProblem = {
			...params,
			algorithm
		};
	} else {
		const { algorithm } = previousProblem;
		newProblem = {
			...params,
			algorithm
		};
	}

	problemStore.set(newProblem);
}

export function resetProblem() {
	const previousProblem = get(problemStore);
	const { variables, ...parms } = previousProblem;
	const newProblem: Problem = {
		variables: new VariablePool(variables.capacity),
		...parms
	};
	problemStore.set(newProblem);
	finsihed.set(false);
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}

export function literalToClauses(clauses: ClausePool): MappingLiteral2Clauses {
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
