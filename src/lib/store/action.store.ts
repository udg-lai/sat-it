import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import { resetTrails, trails, udpateTrails } from './trails.store.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
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
    if(pointerValue - 1 != -1) {
      const lastState = stack[pointerValue - 1];
      udpateTrails(lastState.trailSnapshot);
      updateVariablePool(lastState.variablePoolSnapshot);
    }
    else {
      resetTrails();
      updateVariablePool(new VariablePool(get(problemStore).variables.capacity))
    }
	}
}

export function redo() {
  const pointerValue: number = get(actionPointer);
  const stack: UserAction[] = get(actionStack);
  if(pointerValue + 1 < stack.length) {
    actionPointer.set(pointerValue+1);
    console.log(stack[pointerValue+1]);
    udpateTrails(stack[pointerValue+1].trailSnapshot);
  }
}