import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';
import { logError, logWarning } from '$lib/transversal/utils/logging.ts';
import { get, writable, type Writable } from 'svelte/store';
import { updateProblemDomain } from './problem.store.ts';
import { setNonAssignedVariables } from './debugger.store.ts';
export interface InteractiveInstance extends DimacsInstance {
	removable: boolean;
	active: boolean;
	previewing: boolean;
}

export const instanceStore: Writable<InteractiveInstance[]> = writable([]);

export const activeInstanceStore: Writable<DimacsInstance> = writable();

const defaultInstanceState = {
	removable: false,
	active: false,
	previewing: false
};

const newInstanceState = {
	removable: true,
	active: false,
	previewing: false
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
	// pre: instances already exist
	if (emptyInstanceSet()) {
		logError('Can not set default instance from an empty set');
	} else {
		instanceStore.update((instances) => {
			const newInstances = instances.map((e) => {
				return {
					...e,
					active: false
				};
			});
			const fst = newInstances[0];
			fst.active = true;
			fst.previewing = true;
			activeInstanceStore.set(fst);
			afterActivateInstance(fst);
			return newInstances;
		});
	}
}

function emptyInstanceSet(): boolean {
	const instances = get(instanceStore);
	return instances.length === 0;
}

function updateInstanceStore(newInstances: InteractiveInstance[]): void {
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
	}
}

export function activateInstanceByName(instanceName: string): void {
	// pre: that instance should exist in the store
	instanceStore.update((instances) => {
		const newInstances = instances.map((e) => {
			return {
				...e,
				previewing: false,
				active: false
			};
		});
		const instance = newInstances.find((e) => e.instanceName === instanceName);
		if (instance !== undefined) {
			instance.active = true;
			instance.previewing = true;
			activeInstanceStore.set(instance);
			afterActivateInstance(instance);
		} else {
			logError('Not instance found to activate');
		}
		return newInstances;
	});
	setNonAssignedVariables();
}

export function previewInstanceByName(instanceName: string): void {
	instanceStore.update((instances) => {
		const newInstances = instances.map((e) => {
			return {
				...e,
				previewing: false
			};
		});
		const instance = newInstances.find((e) => e.instanceName === instanceName);
		if (instance !== undefined) {
			instance.previewing = true;
			activeInstanceStore.set(instance);
		} else {
			logError('Not instance found to activate');
		}
		return newInstances;
	});
}

export function removeInstanceByName(instanceName: string): void {
	const filterFun = (e: InteractiveInstance, instanceName: string) => {
		return (
			e.instanceName !== instanceName || (e.instanceName === instanceName && e.removable === false)
		);
	};

	instanceStore.update((instances) => {
		return instances.filter((e) => filterFun(e, instanceName));
	});
}

function afterActivateInstance(instance: DimacsInstance): void {
	updateProblemDomain(instance);
}
