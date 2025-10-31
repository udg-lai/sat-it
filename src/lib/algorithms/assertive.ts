import type Clause from '$lib/entities/Clause.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';

export const assertiveness = (clause: Clause, variables: number[]): boolean => {
	if (clause.isEmpty()) {
		logFatal('Assertiveness check failed', 'Empty clause not allowed in assertiveness check');
	}
	let matches: number = 0;
	let i: number = 0;
	while (i < variables.length && matches < 2) {
		const variableId = variables[i];
		if (clause.containsVariable(variableId)) {
			matches += 1;
		}
		i += 1;
	}
	if (matches === 0) {
		logFatal(
			'Assertiveness check failed',
			'There must be at least one variable inside the conflict clause'
		);
	}
	return matches === 1;
};
