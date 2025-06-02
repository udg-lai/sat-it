import { toggleTrailExpandEventBus } from '$lib/transversal/events.ts';

let trailsExpanded = $state(true);

export const setTrailsExpanded = (expanded: boolean) => {
	trailsExpanded = expanded;
	toggleTrailExpandEventBus.emit(expanded);
};

export const getTrailsExpanded = () => {
	return trailsExpanded;
};
