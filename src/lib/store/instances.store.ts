import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';
import { logError, logWarning } from '$lib/transversal/utils/logging.ts';
import { get, writable, type Writable } from 'svelte/store';
import { updateProblem } from './problem.store.ts';

export interface InteractiveInstance extends DimacsInstance {
	removable: boolean;
	active: boolean;
}

export const instanceStore: Writable<InteractiveInstance[]> = writable([]);

export const activeInstanceStore: Writable<DimacsInstance> = writable();

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
		return initializedInstances;
	};

	try {
		const fetchedInstances: DimacsInstance[] = await fetchInstances();
		const transformedInstances = transform(fetchedInstances);
		updateInstanceStore(transformedInstances);
	} catch (error) {
		const description = (error as Error)?.message;
		logWarning('Could not load instances', `Error: ${description ?? error}`);
	}
}

export function setDefaultInstanceToSolve(): void {
	if (emptyIntanceSet()) {
		logError("Can not set default instance from an empty set")
	}
	else {
		deactiveAllInstances();
		instanceStore.update((instances) => {
			const [fst, ...others] = instances;
			fst.active = true;
			updateActiveInstanceStore(fst);
			return [fst, ...others];
		})
	}
}

function emptyIntanceSet(): boolean {
	let instances = get(instanceStore);
	return instances.length === 0;
}

function deactiveAllInstances(): void {
	instanceStore.update((instances) => {
		return instances.map((instance) => {
			return { ...instance, active: false }
		})
	})
}

function updateInstanceStore(newInstances: InteractiveInstance[]): void {
	instanceStore.set(newInstances);
}

function updateActiveInstanceStore(instance: InteractiveInstance): void {
	activeInstanceStore.set(instance);
	updateProblem()
}

export function activateInstance(instance: InteractiveInstance): void {
	console.log(instance)
	updateActiveInstanceStore(instance);
}


export function addInstance(instance: DimacsInstance): void {
	const found = get(instanceStore).find((i) => i.instanceName === instance.instanceName);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance already loaded in the collection of instances`;
		logWarning(title, description);
	} else {
		instanceStore.update((prev) => [...prev, { ...instance, ...newInstanceState }]);
	}
}
