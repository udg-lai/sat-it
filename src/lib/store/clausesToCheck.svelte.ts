import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import {
	makeSat,
	makeUnresolved,
	type Eval
} from '$lib/transversal/interfaces/IClausePool.ts';

let clausesToCheck: Set<number> = $state(new Set<number>());

let workingTrailPointer: number = $state(-1);

let started: boolean = $state(false);

let finished: boolean = $state(false);

let previousEval: Eval = $state(makeUnresolved());

export function updateWorkingTrailPointer(trails: Trail[], ctc: Set<number>) {
	const workingTrail = trails[trails.length - 1];
	if (workingTrail) {
		workingTrailPointer = workingTrail.getAssignments().length - 1;
	}
	clausesToCheck = ctc;
}

export function checkAndUpdatePointer(variables: VariablePool, trails: Trail[]): boolean {
	if (workingTrailPointer !== trails[trails.length - 1].getAssignments().length - 1) {
		workingTrailPointer += 1;
		return false;
	} else {
		if (variables.allAssigned()) {
			previousEval = makeSat();
			finished = true;
		}
		return true;
	}
}

export function checkedClause(clause: number) {
	clausesToCheck.delete(clause);
}

export function resetWorkingTrailPointer() {
	workingTrailPointer = -1;
	clausesToCheck = new Set<number>();
	previousEval = makeUnresolved();
	finished = false;
	started = false;
}

export function updatePreviousEval(evaluation: Eval) {
	previousEval = evaluation;
}

export function updateStarted(state: boolean) {
	started = state;
}

export function updateFinished(state: boolean) {
	finished = state;
}

export const getClausesToCheck = () => clausesToCheck;

export const getWorkingTrailPointer = () => workingTrailPointer;

export const getPreviousEval = () => previousEval;

export const getStarted = () => started;

export const getFinished = () => finished;
