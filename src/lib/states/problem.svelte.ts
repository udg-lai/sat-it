import Problem from '$lib/entities/Problem.svelte.ts';

const problem: Problem = $state(new Problem());

export const getProblemStore = () => problem;

export const getClausePool = () => getProblemStore().getClausePool();

export const getMapping = () => getProblemStore().getOccurencesTable();

export const getVariablePool = () => getProblemStore().getVariablePool();

export const resetProblem = () => getProblemStore().reset();
