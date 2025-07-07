import type Clause from '$lib/entities/Clause.svelte.ts';
import type { Trail } from '$lib/entities/Trail.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { getClausePool } from './problem.svelte.ts';
import { getSnapshot } from './stack.svelte.ts';

let trails: Trail[] = $state(getSnapshot().snapshot);

export const getLatestTrail = (): Trail | undefined => trails[trails.length - 1];

export const stackTrail = (trail: Trail): void => {
	for (const trail of trails) {
		trail.setView(false);
	}
	trail.setView(true);
	trails = [...trails, trail];
};

export const unstackTrail = (): void => {
	trails = trails.slice(0, length - 1);
};

export const keepTrailsFromBeginningToX = (x: number): void => {
	if (x < 0) {
		logFatal('Keep trail error', `The value x is too low: ${x}`);
	}
	trails = trails.slice(0, x + 1);
};

export const getTrails = () => trails;

export const updateTrails = (snapshot: Trail[]): void => {
	trails = snapshot.map((trail) => trail.copy());
};

export const updateLastTrailEnding = (clauseTag: number): void => {
	const clause: Clause = getClausePool().get(clauseTag);
	trails[trails.length - 1].setConflictiveClause(clause);
};
