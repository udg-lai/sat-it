import { writable, type Writable } from 'svelte/store';
import {
	BOOSTRAP_INSTANCES_CTX_KEY,
	bootstrapInstances
} from '$lib/transversal/utils/bootstrap.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { getContext, hasContext } from 'svelte';
import { logWarning } from '$lib/transversal/utils/logging.ts';

export interface Instance extends DimacsInstance {
	removable: boolean;
	active: boolean;
}

bootstrapInstances();

function initInstances(): Instance[] {
	let instances: Instance[] = [];

	if (hasContext(BOOSTRAP_INSTANCES_CTX_KEY)) {
		const preloadInstances = getContext(BOOSTRAP_INSTANCES_CTX_KEY) as DimacsInstance[];
		const initInteractive = {
			removable: false,
			active: false
		};
		instances = preloadInstances.map((e) => ({ ...e, ...initInteractive }));
		instances[0].active = true;
	} else {
		const title = 'Preloaded instances';
		const description = 'None preloaded instance found';
		logWarning(title, description);
	}

	return instances;
}

export const instances: Writable<Instance[]> = writable(initInstances());
