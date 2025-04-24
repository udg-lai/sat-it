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

export const userActions: Writable<UserAction[]> = writable([]);

export const userActionsPointer: Writable<number> = writable(-1);

export function resetUserActions() {
	userActions.set([]);
	userActionsPointer.set(-1);
}

export function recordAction(type: UserActionType) {
	const action: UserAction = {
		type,
		trailSnapshot: get(trails).map((trail) => trail.copy()),
		variablePoolSnapshot: get(problemStore).variables.copy()
	};
	userActions.update((previousActions) => {
		const pointerValue: number = get(userActionsPointer);
		const updatedActions = [...previousActions.slice(0, pointerValue + 1), action];
		userActionsPointer.set(updatedActions.length - 1);
		return updatedActions;
	});
}

export function undo() {
	const pointerValue: number = get(userActionsPointer);
	if (pointerValue >= 0) {
		userActionsPointer.set(pointerValue - 1);
		const previousActions = get(userActions);
		if (pointerValue - 1 != -1) {
			const lastState = previousActions[pointerValue - 1];
			udpateTrails(lastState.trailSnapshot);
			updateVariablePool(lastState.variablePoolSnapshot);
		} else {
			resetTrails();
			updateVariablePool(new VariablePool(get(problemStore).variables.capacity));
		}
	}
}

export function redo() {
	const pointerValue: number = get(userActionsPointer);
	const previousActions: UserAction[] = get(userActions);
	if (pointerValue + 1 < previousActions.length) {
		userActionsPointer.set(pointerValue + 1);
		udpateTrails(previousActions[pointerValue + 1].trailSnapshot);
		updateVariablePool(previousActions[pointerValue + 1].variablePoolSnapshot);
	}
}
