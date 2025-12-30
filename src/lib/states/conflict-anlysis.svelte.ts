import { ConflictAnalysis } from '$lib/entities/ConflictAnalysis.svelte.ts';
import { fromJust, isNothing, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import { logError } from './toasts.svelte.ts';

let conflictAnalysis: Maybe<ConflictAnalysis> = $state(makeNothing());

export const setConflictAnalysis = (ca: ConflictAnalysis): void => {
	conflictAnalysis = makeJust(ca);
};

export const getConflictAnalysis = (): ConflictAnalysis => {
	if (isNothing(conflictAnalysis)) {
		logError('Conflict Analysis Error', 'No conflict analysis available');
	}
	return fromJust(conflictAnalysis);
};
