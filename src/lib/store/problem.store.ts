import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';

export interface Problem {
	pools: Pools;
	algorithm: () => void;
}

interface Pools {
	variables: VariablePool;
	clauses: ClausePool;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblemDomain(instance: DimacsInstance) {
	const { summary } = instance;
	const { claims } = summary;
	const variables: VariablePool = new VariablePool(summary.varCount);
	const clauses: ClausePool = ClausePool.buildFrom(claims.simplified, variables);

	const pools = {
		variables,
		clauses
	};

	const previousProblem = get(problemStore);
	let algorithm = () => console.log('dummy');
	if (previousProblem !== undefined) {
		algorithm = previousProblem.algorithm;
	}

	const problem = {
		pools,
		algorithm
	};

	problemStore.set(problem);
}

export function updatePools(pools: Pools) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...pools });
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}
