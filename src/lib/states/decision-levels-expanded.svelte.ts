import { toggleTrailExpandEventBus } from '$lib/events/events.ts';

let trailsExpanded = $state(true);

export const setTrailsExpanded = (expanded: boolean) => {
	trailsExpanded = expanded;
	toggleTrailExpandEventBus.emit(expanded);
};

export const getTrailsExpanded = () => {
	return trailsExpanded;
};
