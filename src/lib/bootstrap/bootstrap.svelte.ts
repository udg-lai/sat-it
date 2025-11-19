import pb from '$lib/instances/pb.ts';
import queens3 from '$lib/instances/queens/queens3.ts';
import queens4 from '$lib/instances/queens/queens4.ts';
import logarithmic from '$lib/instances/logarithmic.ts';
import unsatback from '$lib/instances/unsatback.ts';
import unsatdpll from '$lib/instances/unsatdpll.ts';
import satdpll from '$lib/instances/satdpll.ts';
import satbkt from '$lib/instances/satbkt.ts';

import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { InteractiveInstance } from '$lib/entities/InteractiveInstance.svelte.ts';
import type { SvelteMap } from 'svelte/reactivity';
import {
	addInstance,
	afterActivateInstance,
	getInstancesMapping
} from '$lib/states/instances.svelte.ts';
import { logError, logFatal, logWarning } from '$lib/states/toasts.svelte.ts';

const instances: SvelteMap<string, InteractiveInstance> = $derived(getInstancesMapping());

function timeout(ms: number): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
}

async function fakeRequest(): Promise<DimacsInstance[]> {
	await timeout(300);
	return [pb, queens3, queens4, logarithmic, unsatback, unsatdpll, satdpll, satbkt];
}

export default async function fetchInstances(): Promise<DimacsInstance[]> {
	const instances = await fakeRequest();
	return instances;
}

export async function initializeInstances() {
	try {
		const fetchedInstances: DimacsInstance[] = await fetchInstances();
		fetchedInstances.map((di) => {
			addInstance(di);
		});
	} catch (error) {
		const description = (error as Error)?.message;
		logWarning('Could not load instances', `Error: ${description ?? error}`);
	}
}

export function setDefaultInstanceToSolve(): void {
	// pre: instances already exist
	if (emptyInstanceSet()) {
		logError('Can not set default instance from an empty set');
	} else {
		instances.forEach((instance) => instance.deactivate);
		const fst = instances.entries().next().value?.[1];
		if (fst === undefined) {
			logFatal('There are no instances to set');
		}
		fst.activate();
		afterActivateInstance(fst.getInstance());
	}
}

function emptyInstanceSet(): boolean {
	return instances.size === 0;
}
