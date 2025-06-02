import { trailTrackingEventBus } from "$lib/transversal/events.ts";

let lastTrailSize = $state(0);

export let getLastTrailSize = () => lastTrailSize;

export let setLastTrailSize = (width: number) => {
    lastTrailSize = width;
    trailTrackingEventBus.emit(lastTrailSize);
}