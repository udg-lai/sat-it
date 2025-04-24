import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import { trails, udpateTrails } from './trails.store.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import { problemStore, updateVariablePool } from './problem.store.ts';

type UserActionType = 'decision' | 'solveTrail' | 'solveFull';

interface UserAction {
	type: UserActionType;
	trailSnapshot: Trail[];
	variablePoolSnapshot: VariablePool;
}

export const actionStack: Writable<UserAction[]> = writable([]);

export const actionPointer: Writable<number> = writable(-1);

export function resetStack() {
	actionStack.set([]);
	actionPointer.set(-1);
}

export function recordAction(type: UserActionType) {
	const action: UserAction = {
		type,
		trailSnapshot: get(trails).map((trail) => trail.copy()),
		variablePoolSnapshot: get(problemStore).variables.copy()
	};
	actionStack.update((stack) => {
		const pointerValue: number = get(actionPointer);
		const newStack = [...stack.slice(0, pointerValue + 1), action];
		actionPointer.set(newStack.length - 1);
		return newStack;
	});
}

export function undo() {
	const pointerValue: number = get(actionPointer);
	if (pointerValue >= 0) {
		actionPointer.set(pointerValue - 1);
		const stack = get(actionStack);
		const lastState = stack.pop() as UserAction;
		udpateTrails(lastState.trailSnapshot);
		updateVariablePool(lastState.variablePoolSnapshot);
		actionStack.update(() => stack);
	}
}
