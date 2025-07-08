import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { SvelteSet } from 'svelte/reactivity';

// It does not make sense to keep the variable.
// Instead, I think it makes more sense to keep which is the literal that the list belongs to.

export type OccurrenceList = {
	clauses: SvelteSet<number>;
	literal: number;
};

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: Clause;
	decisionLevelVariables: number[];
};
