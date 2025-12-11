import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { Maybe } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: Clause;
	ldlAssignments: Lit[];
};
