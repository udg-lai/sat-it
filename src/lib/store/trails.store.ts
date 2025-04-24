import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { writable, type Writable } from 'svelte/store';

export const trails: Writable<Trail[]> = writable([]);

export function resetTrails() {
	trails.set([]);
}

export function udpateTrails(newState: Trail[]) {
	trails.update(() => {
		return newState;
	});
}
