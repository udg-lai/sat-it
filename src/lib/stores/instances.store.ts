import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { changeInstanceEventBus } from '$lib/events/events.ts';
import fetchInstances from '$lib/bootstrap.ts';
import { logError, logInfo, logWarning } from '$lib/stores/toasts.ts';
import { get, writable, type Writable } from 'svelte/store';
import { updateProblemDomain } from '../states/problem.svelte.ts';
import { modifyLiteralWidth } from '$lib/utils.ts';

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

export function deleteInstanceByName(name: string): void {
	// pre: no active or not removable instance can be deleted

	const filterFun = (e: InteractiveInstance, name: string) => {
		return e.name !== name || (e.name === name && (e.removable === false || e.active === true));
	};

	instanceStore.update((instances) => {
		return instances.filter((e) => filterFun(e, name));
	});

	logInfo('Instance deleted', `Instance ${name} has been deleted`);
}

function afterActivateInstance(instance: DimacsInstance): void {
	modifyLiteralWidth(instance.summary.varCount);
	updateProblemDomain(instance);
	changeInstanceEventBus.emit(instance.name);
}
