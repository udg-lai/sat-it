import { logError } from '$lib/store/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';

const breakpoints: SvelteSet<number> = $state(new SvelteSet<number>());

export type LiteralBreakpoint = {
	type: 'literal';
	literal: number;
};

export const addBreakpoint = (breakpoint: LiteralBreakpoint): void => {
	if (breakpoint.type === 'literal') {
		breakpoints.add(breakpoint.literal);
	} else {
		logError('Unsupported breakpoint type:', breakpoint.type);
	}
};

export const isBreakpoint = (literal: number): boolean => {
	return breakpoints.has(literal);
};

export const removeBreakpoint = (literal: number): void => {
	breakpoints.delete(literal);
};

export const getBreakpoints = () => breakpoints;

export const clearBreakpoints = (): void => {
	breakpoints.clear();
};
