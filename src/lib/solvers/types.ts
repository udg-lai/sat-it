import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

// Kinda static structure that holds the occurrences of clauses for a given literal.
export type Occurrences = {
	occ: Set<CRef>;
	literal: Lit;
};

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: Clause;
	ldlAssignments: Lit[];
};
