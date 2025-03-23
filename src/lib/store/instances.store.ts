import { get, writable, type Writable } from 'svelte/store';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { logInfo, logWarning } from '$lib/transversal/utils/logging.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';

export interface InteractiveInstance extends DimacsInstance {
	removable: boolean;
	active: boolean;
}

export const instanceStore: Writable<InteractiveInstance[]> = writable([]);

const defaultInstanceState = {
	removable: false,
	active: false
};

const newInstanceState = {
	removable: true,
	active: false
};

export async function initializeInstancesStore() {
	const transform = (fetchedInstances: DimacsInstance[]): InteractiveInstance[] => {
		const initializedInstances: InteractiveInstance[] = fetchedInstances.map((di) => ({
			...di,
			...defaultInstanceState
		}));

		// Activate the first instance if available
		if (initializedInstances.length > 0) {
			initializedInstances[0].active = true;
		}

		return initializedInstances;
	};

	try {
		const fetchedInstances: DimacsInstance[] = await fetchInstances();
		const transformedInstances = transform(fetchedInstances);
		setInstances(transformedInstances);
	} catch (error) {
		const description = (error as Error)?.message;
		logWarning('Could not load instances', `Error: ${description ?? error}`);
	}
}

function setInstances(newInstances: InteractiveInstance[]): void {
	instanceStore.set(newInstances);
}

export function addInstance(instance: DimacsInstance): void {
	const found = get(instanceStore).find((i) => i.instanceName === instance.instanceName);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance already loaded in the collection of instances`;
		logWarning(title, description);
	} else {
		instanceStore.update((prev) => [...prev, { ...instance, ...newInstanceState }]);
		logInfo(`File uploaded`, `File ${instance.instanceName} parsed and ready to use`);
	}
}

export function activateInstance(instance: InteractiveInstance): void {
	const idx = get(instanceStore).findIndex((i) => i.instanceName === instance.instanceName);
	const found = idx >= 0;
	if (found) {
		instanceStore.update((prev) => {
			const updated = prev.map((i) => ({ ...i, active: false }));
			updated[idx].active = true;
			return updated;
		});
	} else {
		const title = 'Activating an unknown instance';
		const description = `Instance ${instance.instanceName} not found`;
		logWarning(title, description);
	}
}
