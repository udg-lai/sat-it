import type Variable from '$lib/transversal/entities/Variable.svelte.ts';
import type { Maybe } from '../types/maybe.ts';

export interface IVariablePool {
	poolCapacity: number;

	allAssigned(): boolean;
	nextVariableToAssign(): Maybe<number>;
	dispose(variable: number): void;
	persist(variable: number, assignment: boolean): void;
	get(variable: number): Variable;
}
