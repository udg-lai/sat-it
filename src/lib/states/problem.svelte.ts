import type Clause from '$lib/entities/Clause.svelte.ts';
import Problem from '$lib/entities/Problem.svelte.ts';
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';

const problem: Problem = $state(new Problem());

export const getProblemStore = () => problem;

export const getClausePool = () => getProblemStore().getClausePool();

export const getOccurrencesTableMapping = () => getProblemStore().getOccurrencesTableMapping();

export const getWatchTableMapping = () => getProblemStore().getWatchTableMapping();

export const getVariablePool = () => getProblemStore().getVariablePool();

export const getCurrentOccurrences = () => getProblemStore().getCurrentOccurrences();

export const getFocusedAssignment = () => getProblemStore().getFocusedAssignment();

export const getOccurrenceListQueue = () => getProblemStore().getOccurrenceListQueue();

export const getCurrentWatch = () => getProblemStore().getCurrentWatch();

export const getWatchesQueue = () => getProblemStore().getWatchesQueue();

export const syncProblemWithInstance = (instance: DimacsInstance) => {
	getProblemStore().syncWithDimacsInstance(instance);
};

export const forgetLearnedClauses = (): void => {
	getProblemStore().forgetLearnedClauses();
};

export const learnClauses = (clauses: Clause[]): void => {
	getProblemStore().learnClauses(clauses);
};

export const wipeOccurrences = (): void => {
	getProblemStore().dropOccurrences();
};
