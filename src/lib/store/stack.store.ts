import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';

export interface Snapshot {
	snapshot: Trail[];
}

export let stack: Snapshot[] = [{ snapshot: [] }];

export let stackPointer: number = 0;

export function getSnapshot(): Snapshot {
	return stack[stackPointer];
}

export function resetStack() {
	stack = stack.slice(0, 1);
	stackPointer = 0;
}

export function record(trails: Trail[]) {
	const snapshot: Snapshot = {
		snapshot: trails.map((trail) => trail.copy())
	};
	stack = stack.slice(0, stackPointer + 1);
	stack = [...stack, snapshot]
	stackPointer = stack.length - 1;
}

export function undo(): Snapshot {
	stackPointer = Math.max(0, stackPointer - 1);
	const snapshot = getSnapshot();
	return snapshot;
}

export function redo(): Snapshot {
	stackPointer = Math.min(stack.length - 1, stackPointer + 1);
	const snapshot = getSnapshot();
	return snapshot;
}
