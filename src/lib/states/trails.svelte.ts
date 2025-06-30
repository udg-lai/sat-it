import type { Trail } from '$lib/entities/Trail.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { getSnapshot } from './stack.svelte.ts';

let trails: Trail[] = $state(getSnapshot().snapshot);

export const getLatestTrail = (): Trail | undefined => trails[trails.length - 1];

export const stackTrail = (trail: Trail): void => {
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

export const updateLastTrailEnding = (clauseId: number): void => {
	trails[trails.length - 1].updateTrailConflict(clauseId);
};
