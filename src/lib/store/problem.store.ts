import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	algorithm: () => void;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblemDomain(instance: DimacsInstance) {
	const { summary } = instance;
	const { claims } = summary;
	const variables: VariablePool = new VariablePool(summary.varCount);
	const clauses: ClausePool = ClausePool.buildFrom(claims.simplified, variables);

	const previousProblem = get(problemStore);
	let algorithm = () => console.log('dummy');
	if (previousProblem !== undefined) {
		algorithm = previousProblem.algorithm;
	}

	const problem = {
		variables,
		clauses,
		algorithm
	};

	problemStore.set(problem);
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}
