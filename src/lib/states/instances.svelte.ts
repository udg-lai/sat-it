import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { changeInstanceEventBus } from '$lib/events/events.ts';
import { logError, logFatal, logInfo, logWarning } from '$lib/stores/toasts.svelte.ts';
import { updateProblemDomain } from './problem.svelte.ts';
import { modifyLiteralWidth } from '$lib/utils.ts';
import { SvelteMap } from 'svelte/reactivity';
import type { InteractiveInstanceState } from '$lib/interfaces/InteractiveInstanceState.ts';
import { InteractiveInstance } from '$lib/entities/InteractiveInstance.svelte.ts';

let instances: SvelteMap<string, InteractiveInstance> = new SvelteMap();

const defaultInstanceState: InteractiveInstanceState = {
	removable: false,
	active: false
};

const newInstanceState: InteractiveInstanceState = {
	removable: true,
	active: false
};

export function addInstance(instance: DimacsInstance): void {
	const found = instances.has(instance.name);
	if (found) {
		const title = 'Duplicated instance';
		const description = `Instance ${instance.name} already loaded`;
		logWarning(title, description);
	} else {
		instances.set(instance.name, new InteractiveInstance(instance, newInstanceState));
		logInfo('Instance added', `Instance ${instance.name}`);
	}
}

export function activateInstanceByName(name: string): void {
	// pre: that instance should exist in the store
	instances.forEach((instance) => instance.deactivate());
	const instance: InteractiveInstance | undefined = instances.get(name);
	if (instance !== undefined) {
		instance.active = true;
		afterActivateInstance(instance.getInstance());
	} else {
		logError('Not instance found to activate');
	}
}

export function getActiveInstance(): InteractiveInstance | undefined {
	let activeInstance: InteractiveInstance | undefined = undefined;
	for (const [ , instance] of instances.entries()) {
		if (instance.getActive()) {
			activeInstance = instance;
			break;
		}
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

export function afterActivateInstance(instance: DimacsInstance): void {
	modifyLiteralWidth(instance.summary.varCount);
	updateProblemDomain(instance);
	changeInstanceEventBus.emit(instance.name);
}

export const getInstancesMapping = (): SvelteMap<string, InteractiveInstance> => {
	return instances;
};

export const getInstances = (): InteractiveInstance[] => {
	return [...instances.values()];
};
