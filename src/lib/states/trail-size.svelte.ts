import { trailTrackingEventBus } from '$lib/events/events.ts';

let lastTrailSize = $state(0);

export const getLastTrailSize = () => lastTrailSize;

export const setLastTrailSize = (width: number) => {
	lastTrailSize = width;
	trailTrackingEventBus.emit(lastTrailSize);
};
