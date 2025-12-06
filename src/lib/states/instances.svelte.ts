import { InteractiveInstance } from '$lib/entities/InteractiveInstance.svelte.ts';
import { changeInstanceEventBus } from '$lib/events/events.ts';
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import type { InteractiveInstanceState } from '$lib/interfaces/InteractiveInstanceState.ts';
import { logError, logFatal, logInfo, logWarning } from '$lib/states/toasts.svelte.ts';
import { SvelteMap } from 'svelte/reactivity';

const instances: SvelteMap<string, InteractiveInstance> = new SvelteMap();

const newInstanceState: InteractiveInstanceState = {
	removable: true,
	active: false
};

export function getInteractiveInstance(name: string): InteractiveInstance {
	const instance: InteractiveInstance | undefined = instances.get(name);
	if (!instance) {
		logFatal('Instance not found', `Instance ${name} was not found`);
	}
	return instance;
}

export function getInstance(name: string): DimacsInstance {
	const instance: InteractiveInstance | undefined = instances.get(name);
	if (!instance) {
		logFatal('Instance not found', `Instance ${name} was not found`);
	}
	return instance.getInstance();
}

export function addInstance(instance: DimacsInstance, notify: boolean = false): void {
	const found = instances.has(instance.name);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance ${instance.name} already loaded`;
		logWarning(title, description);
	} else {
		instances.set(instance.name, new InteractiveInstance(instance, newInstanceState));
		if (notify) {
			logInfo('Instance added', `Instance ${instance.name}`);
		}
	}
}

export function activateInstanceByName(name: string): void {
	// pre: that instance should exist in the store
	instances.forEach((instance) => instance.deactivate());
	const instance: InteractiveInstance | undefined = instances.get(name);
	if (instance !== undefined) {
		instance.activate();
		changeInstanceEventBus.emit(instance.getInstance().name);
	} else {
		logError('Not instance found to activate');
	}
}

// There should be always one instance active from the bootstrap
export function getActiveInstance(): InteractiveInstance {
	let activeInstance: InteractiveInstance | undefined = undefined;
	for (const [, instance] of instances.entries()) {
		if (instance.getActive()) {
			activeInstance = instance;
			break;
		}
	}
	if (activeInstance === undefined) {
		logFatal('No active instance', 'There is no active instance in the store');
	}
	return activeInstance;
}

export function deleteInstanceByName(name: string): void {
	// pre: no active or not removable instance can be deleted

	const to_delete: InteractiveInstance | undefined = instances.get(name);
	if (!to_delete) {
		logFatal('Not deleted', `instance ${name} was not found`);
	}
	if (to_delete.canBeDeleted()) {
		instances.delete(to_delete.getInstance().name);
	}

	logInfo('Instance deleted', `Instance ${name} has been deleted`);
}

export const getInstancesMapping = (): SvelteMap<string, InteractiveInstance> => {
	return instances;
};

export const getInstances = (): InteractiveInstance[] => {
	return [...instances.values()];
};

export const thereAreInstances = (): boolean => {
	return instances.size > 0;
};
