import { List, type Lit } from '$lib/types/types.ts';
import { logError, logFatal } from './toasts.svelte.ts';

/**
 * 1, 2, 3, 4up
 * 1, -4up, | 2
 */

export interface SavedDecision {
	decision: Lit;
}

export type SavedDecisions = List<List<SavedDecision>>;

// For each trail it contains the decisions made at that trail
let trailDecisions: SavedDecisions = $state([[]]);

export function getDecisions(): SavedDecisions {
	return trailDecisions;
}

export const wipeDecisions = (): void => {
	trailDecisions = [[]];
}

export function saveDecision(decision: Lit): void {
	if (trailDecisions.length < 1) {
		logError('Decision store', 'Missing last decisions list');
	}
	trailDecisions[trailDecisions.length - 1].push({ decision });
}

export function allocDecisionsTrail(): void {
	trailDecisions.push([]);
}

export function retrieveEarlierDecisions(trailID: number, decision: Lit): List<SavedDecision> {
	// This function retrieves the earlier decisions up to the given trailID,
	// including the decisions made at trailID up to (but not including) the given decision.

	if (trailID < 0 || trailID >= trailDecisions.length) {
		logFatal(
			'Undo',
			`Unknown trailID ${trailID} for trails' decisions of length ${trailDecisions.length}`
		);
	}

	const previousDecisions: List<SavedDecision> = trailDecisions.slice(0, trailID).flat();
	const decisionsAtTrail: List<SavedDecision> = trailDecisions[trailID];
	const previousDecisionsAtTrail = List<SavedDecision>();

	let i = 0;
	let found = false;
	while (i < decisionsAtTrail.length && !found) {
		const { decision: d } = decisionsAtTrail[i];
		if (d == decision) found = true;
		else {
			previousDecisionsAtTrail.push({ decision: d });
			i++;
		}
	}

	if (!found) logFatal('Undo algorithm', 'Decision not found in the decisions lists');

	return previousDecisions.concat(previousDecisionsAtTrail);
}
