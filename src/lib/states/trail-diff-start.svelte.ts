// This state saves (position) differs from the previous trail

import { logError } from './toasts.svelte.ts';

// Position indexes a trail position
let differTrailPositions: number[] = $state([0]);

export const appendDifferTrailPos = (pos: number): void => {
	differTrailPositions.push(pos);
};

export const wipeDifferTrailPos = (): void => {
	differTrailPositions = [0];
};

export const differPos = (trail: number): number => {
	if (trail < 1 && trail > differTrailPositions.length)
		logError('Trail range', 'Not inside [1, nTrails]');
	return differTrailPositions[trail - 1];
};
