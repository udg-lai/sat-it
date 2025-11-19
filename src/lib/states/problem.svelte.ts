import { SvelteSet } from 'svelte/reactivity';
import Problem from '$lib/entities/Problem.svelte.ts';
export type MappingLiteral2Clauses = Map<number, SvelteSet<number>>;

const problem: Problem = $state(new Problem());

export const getProblemStore = () => problem;

export const getClausePool = () => problem.clauses;

export const getMapping = () => problem.mapping;

export const getVariablePool = () => problem.variables;
