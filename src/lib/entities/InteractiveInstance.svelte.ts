import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import type { InteractiveInstanceState } from '$lib/interfaces/InteractiveInstanceState.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';

const defaultInstanceState: InteractiveInstanceState = {
	removable: false,
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
