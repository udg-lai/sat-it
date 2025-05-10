import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type Variable from '$lib/transversal/entities/Variable.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { makeSat, makeUnresolved, type AssignmentEval } from '$lib/transversal/interfaces/IClausePool.ts';
import { SvelteSet } from 'svelte/reactivity';
import { problemStore } from './problem.store.ts';
import { get } from 'svelte/store';

let clausesToCheck: SvelteSet<number> = $state(new SvelteSet<number>());

let workingTrailPointer: number = $state(-1);

let started: boolean = $state(false);

let finished: boolean = $state(false);

let previousEval: AssignmentEval = $state(makeUnresolved());

export function setWorkingTrailPointer(wt: Trail | undefined, toCheck: Set<number>) {
	workingTrailPointer = wt !== undefined ? wt.getAssignments().length - 1 : -1;
	updateClausesToCheck(toCheck);
}

export function updateWorkingTrailPointer(variables: VariablePool, workingTail: Trail): boolean {
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
	if (!refilledToCheck && variables.allAssigned()) {
		previousEval = makeSat();
	}
	return refilledToCheck;
}

function updateClausesToCheck(toCheck: Set<number>) {
	clausesToCheck.clear();
	for (const clause of toCheck) {
		console.dir('clause', clause);
		clausesToCheck = clausesToCheck.add(clause);
	}
}

export function checkedClause(clause: number) {
	clausesToCheck.delete(clause);
}

export function resetWorkingTrailPointer() {
	workingTrailPointer = -1;
	clausesToCheck = new SvelteSet<number>();
	previousEval = makeUnresolved();
	started = false;
	finished = false;
}

export function updatePreviousEval(evaluation: AssignmentEval) {
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
