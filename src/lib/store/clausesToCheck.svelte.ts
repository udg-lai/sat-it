import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { makeSat, makeUnresolved, type Eval } from '$lib/transversal/interfaces/IClausePool.ts';
import { SvelteSet } from 'svelte/reactivity';

let clausesToCheck: SvelteSet<number> = $state(new SvelteSet<number>());

let workingTrailPointer: number = $state(-1);

let finished: boolean = $state(false);

let previousEval: Eval = $state(makeUnresolved());

export function updateWorkingTrailPointer(wt: Trail | undefined, toCheck: Set<number>) {
	if (wt) {
		workingTrailPointer = wt.getAssignments().length - 1;
	}
	clausesToCheck.clear();
	for (const clause of toCheck) {
		console.dir('clause', clause);
		clausesToCheck = clausesToCheck.add(clause);
	}
}

export function checkAndUpdatePointer(variables: VariablePool, workingTail: Trail): boolean {
	if (workingTrailPointer !== workingTail.getAssignments().length - 1) {
		workingTrailPointer += 1;
		return true;
	} else {
		if (variables.allAssigned()) {
			previousEval = makeSat();
		}
		return false;
	}
}

export function checkedClause(clause: number) {
	clausesToCheck.delete(clause);
}

export function resetWorkingTrailPointer() {
	workingTrailPointer = -1;
	clausesToCheck = new SvelteSet<number>();
	previousEval = makeUnresolved();
	finished = false;
}

export function updatePreviousEval(evaluation: Eval) {
	previousEval = evaluation;
}

export function updateFinished(state: boolean) {
	finished = state;
}

export const getClausesToCheck = () => clausesToCheck;

export const getWorkingTrailPointer = () => workingTrailPointer;

export const getPreviousEval = () => previousEval;

export const getFinished = () => finished;
