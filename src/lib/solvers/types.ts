import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { CRef, Lit, Var } from '$lib/types/types.ts';

export type OccurrenceList = {
	clauses: Set<CRef>;
	literal: Lit;
};

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: Clause;
	decisionLevelVariables: Var[];
};
