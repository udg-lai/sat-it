import { Trail } from '$lib/entities/Trail.svelte.ts';
import { type Statistics } from './statistics.svelte.ts';

export interface Snapshot {
	snapshot: Trail[];
	activeState: number;
	statistics: Statistics;
	record?: Record<string, unknown>;
}

let stack: Snapshot[] = $state([
	{
		snapshot: [new Trail()],
		activeState: 0,
		statistics: { noDecisions: 0, noConflicts: 0, noUnitPropagations: 0, clausesLeft: {} }
	}
]);

let stackPointer: number = $state(0);

export function getSnapshot(): Snapshot {
	return stack[stackPointer];
}

export function resetStack() {
	stack = stack.slice(0, 1);
	stackPointer = 0;
}

export function record(
	trails: Trail[],
	activeState: number,
	statistics: Statistics,
	record?: Record<string, unknown>
) {
	const snapshot: Snapshot = {
		snapshot: trails.map((trail) => trail.copy()),
		activeState: activeState,
		statistics,
		record
	};
	stack = stack.slice(0, stackPointer + 1);
	stack = [...stack, snapshot];

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

export const getStackPointer = () => stackPointer;

export const getStackLength = () => stack.length;
