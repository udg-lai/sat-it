import { logError } from '$lib/store/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';

const variableBreakpoint: SvelteSet<number> = $state(new SvelteSet<number>());

export type Assignment = {
	type: 'variable';
	id: number;
};

export type VariableBreakpoint = {
	type: 'variable';
	variableId: number;
};

export type Breakpoint = VariableBreakpoint;

export const addBreakpoint = (breakpoint: Breakpoint): void => {
	if (breakpoint.type === 'variable') {
		variableBreakpoint.add(breakpoint.variableId);
	} else {
		logError('Unsupported breakpoint type:', breakpoint.type);
	}
};

export const markedAsBreakpoint = (assignment: Assignment): boolean => {
	let checkVariableId: boolean = false;
	if (assignment.type === 'variable') {
		checkVariableId = variableBreakpoint.has(assignment.id);
	} else {
		logError('Unsupported assignment type:', assignment.type);
	}
	return checkVariableId;
};

export const removeBreakpoint = (breakpoint: Breakpoint): void => {
	if (breakpoint.type === 'variable') {
		variableBreakpoint.delete(breakpoint.variableId);
	} else {
		logError('Unsupported breakpoint type:', breakpoint.type);
	}
};

export const getBreakpoints = () => variableBreakpoint;