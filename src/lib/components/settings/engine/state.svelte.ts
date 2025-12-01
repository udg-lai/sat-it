import { type Algorithm } from '$lib/types/algorithm.ts';

// Default algorithm for the engine settings
let currentAlgorithm: Algorithm = $state('cdcl');

export const getConfiguredAlgorithm = () => currentAlgorithm;

export const setConfiguredAlgorithm = (algorithm: Algorithm) => {
	currentAlgorithm = algorithm;
};
