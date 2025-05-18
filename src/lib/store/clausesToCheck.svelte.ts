import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { SvelteSet } from 'svelte/reactivity';
import { problemStore } from './problem.store.ts';
import { get } from 'svelte/store';

let clausesToCheck: SvelteSet<number> = $state(new SvelteSet<number>());

let workingTrailPointer: number = $state(-1);

let activeState: number = $state(0);

export function setWorkingTrailPointer(wt: Trail | undefined, toCheck: Set<number>) {
	workingTrailPointer = wt !== undefined ? wt.getAssignments().length - 1 : -1;
	updateClausesToCheck(toCheck);
}

export function updateWorkingTrailPointer(workingTail: Trail): boolean {
	let refilledToCheck = false;
	workingTrailPointer += 1;
	while (workingTrailPointer < workingTail.getAssignments().length && !refilledToCheck) {
		const variableAtPointer: Variable = workingTail
			.getAssignments()
			[workingTrailPointer].getVariable();
		const literalToCheck: number = variableAtPointer.getAssignment()
			? -variableAtPointer.getInt()
			: variableAtPointer.getInt();
		const toCheck = get(problemStore).mapping.get(literalToCheck);
		if (toCheck) {
			updateClausesToCheck(toCheck);
			refilledToCheck = true;
		} else {
			workingTrailPointer += 1;
		}
	}
	return refilledToCheck;
}

export function updateClausesToCheck(toCheck: Set<number>) {
	clausesToCheck.clear();
	for (const clause of toCheck) {
		//console.dir('clause', clause);
		clausesToCheck = clausesToCheck.add(clause);
	}
}

export function updateActiveState(newState: number) {
	activeState = newState;
}

export function checkedClause(clause: number) {
	clausesToCheck.delete(clause);
}

export function resetWorkingTrailPointer() {
	workingTrailPointer = -1;
	clausesToCheck = new SvelteSet<number>();
}

export const getClausesToCheck = () => clausesToCheck;

export const getWorkingTrailPointer = () => workingTrailPointer;

export const getActiveState = () => activeState;
