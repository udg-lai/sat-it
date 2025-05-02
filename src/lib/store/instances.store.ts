import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { changeInstanceEventBus } from '$lib/transversal/events.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';
import { logError, logInfo, logWarning } from '$lib/transversal/utils/logging.ts';
import { get, writable, type Writable } from 'svelte/store';
import { updateProblemDomain } from './problem.store.ts';

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
	const found = get(instanceStore).find((i) => i.name === instance.name);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance ${instance.name} already loaded`;
		logWarning(title, description);
	} else {
		instanceStore.update((prev) => [...prev, { ...instance, ...newInstanceState }]);
		logInfo('Instance added', `Instance ${instance.name}`);
	}
}

export function activateInstanceByName(name: string): void {
	// pre: that instance should exist in the store
	instanceStore.update((instances) => {
		const newInstances = instances.map((e) => {
			return {
				...e,
				active: false
			};
		});
		const instance = newInstances.find((e) => e.name === name);
		if (instance !== undefined) {
			instance.active = true;
			afterActivateInstance(instance);
		} else {
			logError('Not instance found to activate');
		}
		return newInstances;
	});
}

export function getActiveInstance(): InteractiveInstance | undefined {
	const active = get(instanceStore).find((i) => i.active);
	return active;
}

export function removeInstanceByName(name: string): void {
	const filterFun = (e: InteractiveInstance, name: string) => {
		return e.name !== name || (e.name === name && e.removable === false);
	};

	instanceStore.update((instances) => {
		return instances.filter((e) => filterFun(e, name));
	});
}

function afterActivateInstance(instance: DimacsInstance): void {
	updateProblemDomain(instance);
	changeInstanceEventBus.emit();
}
