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

export const shrinkTrails = (n: number): void => {
	// This function reduces the trails array to the n trails (inclusive)
	if (n < 0) {
		logFatal('Shrink Trails Error', `Shrink size should be non-negative: ${n}`);
	}
	trails = trails.slice(0, n + 1);
};

export const getTrails = () => trails;

export const wrapLearnedClauses = (): Clause[] => {
	// This function goes through the trails and collects all learned clauses
	const clauses: Clause[] = [];
	for (const trail of trails) {
		if (trail.hasLemmaAttached()) {
			const clause: Clause = trail.getClauseLearned();
			if (!clause.hasBeenLearned()) {
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

export const updateTrails = (snapshot: Trail[]): void => {
	trails = snapshot.map((trail) => trail.copy());
};

export const updateLastTrailEnding = (clauseTag: number): void => {
	const clause: Clause = getClausePool().get(clauseTag);
	trails[trails.length - 1].setConflictiveClause(clause);
};
