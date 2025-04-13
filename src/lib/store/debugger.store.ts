import { makeNothing, type Maybe } from '$lib/transversal/utils/types/maybe.ts';
import { get, writable, type Writable } from 'svelte/store';
import { problemStore } from './problem.store.ts';

export const followingVariable: Writable<Maybe<number>> = writable(makeNothing());

export const assignedVariables: Writable<number[]> = writable([]);

export function updateFollowingVariable(): void {
	followingVariable.update(() => {
		return get(problemStore).pools.variables.nextVariableToAssign();
	});
}

export function setNonAssignedVariables(): void {
	assignedVariables.set([]);
}

export function updateAssignedVariables(remove: boolean, variable: number): void {
	assignedVariables.update((oldNAV) => {
		let newNAV;
		if (remove) {
			newNAV = oldNAV.filter((v) => v !== variable);
		} else {
			newNAV = oldNAV;
			newNAV.push(variable);
		}
		return newNAV;
	});
}
