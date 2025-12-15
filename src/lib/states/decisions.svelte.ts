import { Trail } from '$lib/entities/Trail.svelte.ts';
import { List, type Lit } from '$lib/types/types.ts';
import { type Statistics } from './statistics.svelte.ts';
import { logError } from './toasts.svelte.ts';


/**
 * 1, 2, 3, 4up
 * 1, -4up, | 2 
 */

export interface SavedDecision {
	decision: Lit;
}

export type SavedDecisions = List<List<SavedDecision>>

let decisions: SavedDecisions = $state([[]]);

export function getDecisions(): SavedDecisions {
	return decisions;
}

export function wipeDecisions() {
	decisions = [[]];
}

export function saveDecision(decision: Lit) {
	if (decisions.length < 1) {
		logError("Decision store", "Missing last decisions list")
	}
	decisions[decisions.length - 1].push( { decision } );
}

export function undo(trailPos: number, decision: Lit ): List<SavedDecision> {
	if (trailPos < 1 || trailPos > decisions.length) {
		logError("Undo", "Saved index out of range")
	}

	const previousTrailPos = decisions.slice(0, trailPos - 1);
	const decisionsAtPos: List<SavedDecision> = decisions[trailPos - 1];
	const atTrailPos = List<SavedDecision>();

	let i = 0;
	let found = false;
	while (i < decisionsAtPos.length && !found)
	{
		const { decision: d } = decisionsAtPos[i];
		if (d == decision) found = true;
		else {
			atTrailPos.push({ decision: d });
			i++;
		}
	}

	if (!found) logError("Undo algorithm", "Decision not found in the decisions lists");

	return previousTrailPos.flat().concat(atTrailPos);
}

