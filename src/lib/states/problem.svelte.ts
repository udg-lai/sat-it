import Problem from '$lib/entities/Problem.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';

const problem: Problem = $state(new Problem());

export const getProblemStore = () => problem;

export const getClausePool = () => getProblemStore().getClausePool();

export const getMapping = () => getProblemStore().getOccurrencesTable();

export const getVariablePool = () => getProblemStore().getVariablePool();

export const resetProblem = () => getProblemStore().reset();

export const syncProblemWithInstance = (instance: DimacsInstance) => {
	getProblemStore().syncWithDimacsInstance(instance);
};

export const syncProblemWithTrail = (trail: Trail) => {
	getProblemStore().syncWithTrail(trail);
};
