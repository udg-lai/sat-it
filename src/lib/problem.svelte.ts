import { get, writable, type Writable } from 'svelte/store';
import VariablePool from './transversal/entities/VariablePool.ts';

interface Problem {
	pools: Pools;
	algorithm: () => void;
}

interface Pools {
	variables: VariablePool;
	clauses: VariablePool;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblem(p: Problem) {
	problemStore.set(p);
}

export function updatePools(pools: Pools) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...pools });
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}
