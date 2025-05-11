import { getSnapshot } from './stack.svelte.ts';
import type { Trail } from '../transversal/entities/Trail.svelte.ts';

let trails: Trail[] = $state(getSnapshot().snapshot);

export const getLatestTrail = (): Trail | undefined => trails[trails.length - 1];

export const stackTrail = (trail: Trail): void => {
	trails = [...trails, trail];
};

export const unstackTrail = (): void => {
	trails = trails.slice(0, length - 1);
};

export const getTrails = (): Trail[] => {
	return trails;
};

export const updateTrails = (snapshot: Trail[]): void => {
	trails = [...snapshot];
};
