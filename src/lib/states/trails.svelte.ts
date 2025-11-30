import type Clause from '$lib/entities/Clause.svelte.ts';
import { Trail } from '$lib/entities/Trail.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { getClausePool } from './problem.svelte.ts';

let trails: Trail[] = $state([new Trail()]);

export const getLatestTrail = (): Trail | undefined => trails[trails.length - 1];

export const stackTrail = (trail: Trail): void => {
	trails = [...trails, trail];
	for (let i = 0; i < trails.length; i++) {
		trails.at(i)?.setView(false);
	}
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
