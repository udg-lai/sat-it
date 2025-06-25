import type TemporalClause from '$lib/entities/TemporalClause.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type { SvelteSet } from 'svelte/reactivity';

export type ConflictDetection = {
	clauses: SvelteSet<number>;
	variableReasonId: number;
};

export type ConflictAnalysis = {
	trail: Trail;
	conflictClause: TemporalClause;
	decisionLevelVariables: number[];
};
