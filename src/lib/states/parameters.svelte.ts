import { stepDelayEventBus } from '$lib/events/events.ts';

export const MIN_DELAY_PARAMETER: number = 1;
export const MAX_DELAY_PARAMETER: number = 10;
export const STEP_DELAY_PARAMETER: number = 0.5;

const MIN_DELAY_MS_PARAMETERS: number = MIN_DELAY_PARAMETER * 100;
const MAX_DELAY_MS_PARAMETERS: number = MAX_DELAY_PARAMETER * 100;

// Configured delay [1..10] solver
let confDelay: number = $state(3);

// Mapping to milliseconds, inverse exponential scale
const confDelayMS: number = $derived.by(() => {
	const inverseDecay: number =
		MIN_DELAY_MS_PARAMETERS *
		(MAX_DELAY_MS_PARAMETERS / MIN_DELAY_MS_PARAMETERS) **
			((MAX_DELAY_PARAMETER - confDelay) / (MAX_DELAY_PARAMETER - MIN_DELAY_PARAMETER));
	return Math.floor(inverseDecay);
});

export const getConfDelay = () => confDelay;

export const setConfDelay = (delay: number): void => {
	// Updates the delay within bounds
	confDelay = Math.min(Math.max(delay, MIN_DELAY_PARAMETER), MAX_DELAY_PARAMETER);
	// Notify the change to the event bus
	stepDelayEventBus.emit(getConfDelayMS());
};

export const getConfDelayMS = () => confDelayMS;

export const DEFAULT_POLARITY = true;

let baselinePolarity: boolean = $state(DEFAULT_POLARITY);

export const setBaselinePolarity = (): void => {
	baselinePolarity = !baselinePolarity;
};

export const getBaselinePolarity = () => baselinePolarity;
