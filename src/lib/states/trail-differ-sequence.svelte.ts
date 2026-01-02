// This state saves (position) differs from the previous trail

import { logFatal } from './toasts.svelte.ts';

// Array of positions that contains the differ point for each trail with the previous one
let differSequence: number[] = $state([0]);

export const stackDifferPos = (index: number): void => {
	if (index < 0) logFatal('Tried to append invalid differ trail position');

	differSequence.push(index);
};

export const wipeDifferSequence = (): void => {
	differSequence = [0];
};

export const differOf = (trailID: number): number => {
	if (trailID < 0 || trailID >= differSequence.length)
		logFatal('Tried to access invalid differ trail position index');
	return differSequence[trailID];
};
