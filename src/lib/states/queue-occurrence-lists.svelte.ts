import type OccurrenceList from "$lib/entities/OccurrenceList.svelte.ts";
import { Queue } from "$lib/entities/Queue.svelte.ts";

let occurrencesQueue: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());

export function getOccurrenceListQueue(): Queue<OccurrenceList> {
    return occurrencesQueue;
}

export function setOccurrenceListQueue(newQueue: Queue<OccurrenceList>): void {
    occurrencesQueue = newQueue;
}

export function wipeOccurrenceListQueue(): void {
    const queue: Queue<OccurrenceList> = getOccurrenceListQueue();
	while (!queue.isEmpty()) {
		queue.dequeue();
	}
}