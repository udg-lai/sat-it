import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { SvelteSet } from 'svelte/reactivity';

export type OccurrenceList = {
	clauses: SvelteSet<number>;
	literal: number;
};

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: Clause;
	decisionLevelVariables: number[];
};
