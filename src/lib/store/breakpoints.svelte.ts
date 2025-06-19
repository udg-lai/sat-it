import { logError } from '$lib/store/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';

const variableBreakpoint: SvelteSet<number> = $state(new SvelteSet<number>());

export type LiteralBreakpoint = {
	type: 'literal';
	literal: number;
};

export const addBreakpoint = (breakpoint: LiteralBreakpoint): void => {
	if (breakpoint.type === 'literal') {
		variableBreakpoint.add(breakpoint.literal);
	} else {
		logError('Unsupported breakpoint type:', breakpoint.type);
	}
};

export const isBreakpoint = (literal: number): boolean => {
	return variableBreakpoint.has(literal);
};

export const removeBreakpoint = (literal: number): void => {
	variableBreakpoint.delete(literal);
};

export const getBreakpoints = () => variableBreakpoint;

export const clearBreakpoints = (): void => {
	variableBreakpoint.clear();
};
