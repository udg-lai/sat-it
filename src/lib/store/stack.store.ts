import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import { problemStore } from './problem.store.ts';

interface TrailStack {
	stack: Trail[];
}

//Writable that will contain the Different states of trails
export const trailStack: Writable<TrailStack[]> = writable([]);

//Writable that will know which is the current activeTrail
export const stackPointer: Writable<number> = writable(0);

//Writable that will contain the current active trail
export const activeTrail: Writable<Trail[]> = writable([]);

export function resetStack() {
	trailStack.set([
		{
			stack: [new Trail(get(problemStore).variables.nVariables())]
		}
	]);
	stackPointer.set(0);
	updateActiveTrail(get(trailStack)[0].stack);
}

export function recordStack(trailsSnapshot: Trail[]) {
	const action: TrailStack = {
		stack: trailsSnapshot.map((trail) => trail.copy())
	};
	trailStack.update((previousStack) => {
		const pointerValue: number = get(stackPointer);
		const updatedStack = [...previousStack.slice(0, pointerValue + 1), action];
		stackPointer.set(updatedStack.length - 1);
		updateActiveTrail(updatedStack[updatedStack.length - 1].stack);
		return updatedStack;
	});
}

function updateActiveTrail(currentTrailCollection: Trail[]) {
	activeTrail.update(() => {
		return currentTrailCollection.map((trail) => trail.copy());
	});
}

export function undo() {
	const pointerValue: number = get(stackPointer);
	if (pointerValue > 0) {
		stackPointer.set(pointerValue - 1);
		const previousStack = get(trailStack);
		updateActiveTrail(previousStack[pointerValue - 1].stack);
	}
}

export function redo() {
	const pointerValue: number = get(stackPointer);
	const previousStack: TrailStack[] = get(trailStack);
	if (pointerValue + 1 < previousStack.length) {
		stackPointer.set(pointerValue + 1);
		updateActiveTrail(previousStack[pointerValue + 1].stack);
	}
}
