import type Clause from '$lib/entities/Clause.svelte.ts';
import { Trail } from '$lib/entities/Trail.svelte.ts';
import { newTrailStackedEventBus } from '$lib/events/events.ts';
import { logFatal, logWarning } from '$lib/states/toasts.svelte.ts';

// This is an invariant, at least one trail must always exist
let trails: Trail[] = $state([new Trail()]);

export const getLatestTrail = (): Trail => {
	if (trails.length === 0) {
		logFatal('Get Latest Trail Error', 'No trails available to get the latest trail');
	}
	return trails[trails.length - 1];
};

export const nTrails = (): number => {
	return trails.length;
};

export const collapseTrailsContext = (): void => {
	trails.forEach((trail) => trail.collapseContext());
};

export const stackTrail = (trail: Trail): void => {
	trails = [...trails, trail];
	newTrailStackedEventBus.emit();
};

export const shrinkTrails = (n: number): void => {
	// Shrink the trail to n elements
	if (n <= 1) {
		logWarning('Shrink Trails Error', `Cannot shrink trails to less than 1 trail`);
	}
	trails = trails.slice(0, Math.max(n, 1));
};

export const getTrails = () => trails;

export const wipeTrails = (): void => {
	trails = [new Trail()];
	newTrailStackedEventBus.emit();
};

export const wrapLearnedClauses = (): Clause[] => {
	// This function goes through the trails and collects all learned clauses
	const clauses: Clause[] = [];
	for (const trail of trails) {
		if (trail.hasLemmaAttached()) {
			const clause: Clause = trail.getAttachedLemma();
			if (!clause.isLemma()) {
				logFatal(
					'Wrap Learned Clauses Error',
					'Clause in trail marked as learned but clause itself is not marked as learned'
				);
			}
			clauses.push(clause);
		}
	}
	return clauses;
};
