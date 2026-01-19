import { expandEditorTrailsEventBus } from '$lib/events/events.ts';

let trailsExpanded = $state(true);

export const setTrailsExpanded = (expanded: boolean) => {
	trailsExpanded = expanded;
	expandEditorTrailsEventBus.emit(expanded);
};

export const getTrailsExpanded = () => {
	return trailsExpanded;
};
