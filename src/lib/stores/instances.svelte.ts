import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { changeInstanceEventBus } from '$lib/events/events.ts';
import { logError, logFatal, logInfo, logWarning } from '$lib/states/toasts.svelte.ts';
import { getProblemStore } from '../states/problem.svelte.ts';
import { modifyLiteralWidth } from '$lib/utils.ts';
import { SvelteMap } from 'svelte/reactivity';
import fetchInstances from '$lib/bootstrap.ts';

interface InteractiveInstanceState {
	removable: boolean;
	active: boolean;
}

const defaultInstanceState: InteractiveInstanceState = {
	removable: false,
	active: false
};

const newInstanceState: InteractiveInstanceState = {
	removable: true,
	active: false
};

export class InteractiveInstance {
	instance: DimacsInstance;
	removable: boolean | undefined = $state();
	active: boolean | undefined = $state();

	constructor(instance: DimacsInstance, state: InteractiveInstanceState = defaultInstanceState) {
		this.instance = instance;
		this.removable = state.removable;
		this.active = state.active;
	}

	getInstance(): DimacsInstance {
		return this.instance;
	}

	getInstanceName(): string {
		return this.instance.name;
	}

	getActive(): boolean {
		if (this.active === undefined) {
			logFatal("Instance has no 'active' attribute", 'The active attribute is undefined');
		}
		return this.active;
	}

	getRemovable(): boolean {
		if (this.removable === undefined) {
			logFatal("Instance has no 'removable' attribute", 'The removable attribute is undefined');
		}
		return this.removable;
	}

	activate(): void {
		this.active = true;
	}

	deactivate(): void {
		this.active = false;
	}

	canBeDeleted(): boolean {
		if (this.active === undefined || this.removable === undefined) {
			logFatal(
				"Instance has no 'active' or 'removable' attribute",
				"The 'active' or 'removable' attribute is undefined"
			);
		}
		return !this.active && this.removable;
	}
}

const instances: SvelteMap<string, InteractiveInstance> = new SvelteMap();

export async function initializeInstancesStore() {
	try {
		const fetchedInstances: DimacsInstance[] = await fetchInstances();
		fetchedInstances.map((di) => {
			instances.set(di.name, new InteractiveInstance(di, defaultInstanceState));
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
	for (const [, instance] of instances.entries()) {
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

function afterActivateInstance(instance: DimacsInstance): void {
	modifyLiteralWidth(instance.summary.varCount);
	getProblemStore().updateProblemDomain(instance);
	//updateProblemDomain(instance);
	changeInstanceEventBus.emit(instance.name);
}

export const getInstances = (): InteractiveInstance[] => {
	return [...instances.values()];
};
