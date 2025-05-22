export const MAX_DELAY_MS: number = $state(1000);
export const MIN_DELAY_MS: number = $state(100);

let stepDelay: number = $state(MIN_DELAY_MS);

export const getStepDelay = () => stepDelay;

export const setStepDelay = (delay: number) => {
	stepDelay = Math.min(Math.max(delay, MIN_DELAY_MS), MAX_DELAY_MS);
};
