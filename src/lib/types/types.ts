import type { Trail } from '$lib/entities/Trail.svelte.ts';

export type ErrorMessage = string;
export type WarningMessage = string;
export type InfoMessage = string;

export type Message = ErrorMessage | WarningMessage | InfoMessage;

export type Var = number;

export type Lit = number;

export type CRef = number;

export type List<T> = T[];

export type NeverFn = () => never;

export const List = <T>(): List<T> => {
	return [];
};

export const Lit = (n: number): Lit => {
	return n as Lit;
};

export type ComposedTrail = {
	trail: Trail;
	id: number;
	expanded: boolean;
	isLast: boolean;
	showUPs: boolean;
	showCA: boolean;
};
