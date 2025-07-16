let inspectedVariable: number = $state(0);

export const setInspectedVariable = (variable: number): void => {
	inspectedVariable = variable;
};

export const resetInspectedVariable = (): void => {
	inspectedVariable = 0;
};

export const getInspectedVariable = () => inspectedVariable;
