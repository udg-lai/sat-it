export const MIN_DELAY: number = 1;
export const MAX_DELAY: number = 10;
export const STEP_DELAY: number = 0.5;

let baselineDelay: number = $state(3);

export const getBaselineDelay = () => baselineDelay;

export const setBaselineDelay = (delay: number): void => {
	baselineDelay = Math.min(Math.max(delay, MIN_DELAY), MAX_DELAY);
};

export const DEFAULT_POLARITY = true;

let baselinePolarity: boolean = $state(DEFAULT_POLARITY);

export const setBaselinePolarity = (): void => {
	baselinePolarity = !baselinePolarity;
};

export const getBaselinePolarity = () => baselinePolarity;
