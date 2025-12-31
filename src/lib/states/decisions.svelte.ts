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

let decisions: SavedDecisions = $state([[]]);

export function getDecisions(): SavedDecisions {
	return decisions;
}

export function wipeDecisions() {
	decisions = [[]];
}

export function saveDecision(decision: Lit) {
	if (decisions.length < 1) {
		logError('Decision store', 'Missing last decisions list');
	}
	decisions[decisions.length - 1].push({ decision });
}

export function allocDecisionsTrail() {
	decisions.push([]);
}

export function undo(trailID: number, decision: Lit): List<SavedDecision> {
	if (trailID < 0 || trailID >= decisions.length) {
		logFatal(
			'Undo',
			`Unknown trailID ${trailID} for trails' decisions of length ${decisions.length}`
		);
	}

	const previousDecisions: List<SavedDecision> = decisions.slice(0, trailID).flat();
	const decisionsAtTrail: List<SavedDecision> = decisions[trailID];
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
