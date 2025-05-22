let stepDelay: number = $state(1);

export const getStepDelay = () => stepDelay;

export const setStepDelay = (delay: number) => {
	stepDelay = delay;
};

let defaultPolarity: boolean = $state(true);

export const updateDefaultPolarity = (): void => {
	defaultPolarity = !defaultPolarity;
};

export const getDefaultPolarity = () => defaultPolarity;
