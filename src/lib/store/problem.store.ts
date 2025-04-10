import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { activeInstanceStore, instanceStore, type InteractiveInstance } from './instances.store.ts';

export interface Problem {
	pools: Pools;
	algorithm: () => void;
}

interface Pools {
	variables: VariablePool;
	clauses: ClausePool;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblem(p: Problem) {
	problemStore.set(p);
}

function getActiveProblem(): Problem {
	const activeInstance = get(activeInstanceStore)
	const { summary } = activeInstance;
	const { claims } = summary;
	const variables: VariablePool = new VariablePool(summary.varCount);
	const clauses: ClausePool = new ClausePool(fromClaimsToClause(claims.simplified, variables));

	const pools = {
		variables,
		clauses
	};

	const previousProblem = get(problemStore);
	let algorithm = () => console.log('dummy');
	if (previousProblem !== undefined) {
		algorithm = previousProblem.algorithm;
	}

	const problem = { pools, algorithm };

} 

export function updatePools(pools: Pools) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...pools });
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}
