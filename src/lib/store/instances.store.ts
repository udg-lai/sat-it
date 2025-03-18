import { get, writable, type Writable } from 'svelte/store';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { logInfo, logWarning } from '$lib/transversal/utils/logging.ts';
import bootstrapRequest from '$lib/transversal/utils/bootstrap-instances.ts';

export interface InteractiveInstance extends DimacsInstance {
	removable: boolean;
	active: boolean;
}

const instances: Writable<InteractiveInstance[]> = writable([]);

const defaultInstanceState = {
	removable: false,
	active: false
};

const newInstanceState = {
	removable: true,
	active: false
};

async function loadInstances() {
	try {
		const fetchedInstances: DimacsInstance[] = await bootstrapRequest();
		const transformedInstances = transformInstances(fetchedInstances);
		setInstances(transformedInstances);
	} catch (error) {
		const description = (error as Error)?.message;
		logWarning('Could not load instances', `Error: ${description ?? error}`);
	}
}

function transformInstances(fetchedInstances: DimacsInstance[]): InteractiveInstance[] {
	const initializedInstances: InteractiveInstance[] = fetchedInstances.map((di) => ({
		...di,
		...defaultInstanceState
	}));

	// Activate the first instance if available
	if (initializedInstances.length > 0) {
		initializedInstances[0].active = true;
	}

	return initializedInstances;
}

function setInstances(newInstances: InteractiveInstance[]): void {
	instances.set(newInstances);
}

function addInstance(instance: DimacsInstance): void {
	const found = get(instances).find((i) => i.instanceName === instance.instanceName);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance already loaded in the collection of instances`;
		logWarning(title, description);
	} else {
		instances.update((prev) => [...prev, { ...instance, ...newInstanceState }]);
		logInfo(`File uploaded`, `File ${instance.instanceName} parsed and ready to use`);
	}
}

function activateInstance(instance: InteractiveInstance): void {
	const idx = get(instances).findIndex((i) => i.instanceName === instance.instanceName);
	const found = idx >= 0;
	if (found) {
		instances.update((prev) => {
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

export { activateInstance, addInstance, loadInstances, instances };
