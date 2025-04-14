import { makeNothing, type Maybe } from '$lib/transversal/utils/types/maybe.ts';
import { get, writable, type Writable } from 'svelte/store';
import { problemStore } from './problem.store.ts';

export const followingVariable: Writable<Maybe<number>> = writable(makeNothing());

export const assignedVariables: Writable<number[]> = writable([]);

export function updateFollowingVariable(): void {
	followingVariable.update(() => {
		return get(problemStore).variables.nextVariableToAssign();
	});
}
