import type { Var } from '$lib/types/types.ts';

let inspectedVariable: number = $state(0);

export const setInspectedVariable = (variable: Var): void => {
	inspectedVariable = variable;
};

export const resetInspectedVariable = (): void => {
	inspectedVariable = 0;
};

export const getInspectedVariable = () => inspectedVariable;
