import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';
import { logFatal, logInfo, logWarning } from '$lib/transversal/utils/logging.ts';
import { fromClaimsToClause } from '$lib/transversal/utils/utils.ts';
import { get, writable, type Writable } from 'svelte/store';
import { problemStore, updateProblem } from './problem.store.ts';
import { setNonAssignedVariables } from './debugger.store.ts';

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
		setInstanceToSolve(idx);
	} else {
		const title = 'Activating an unknown instance';
		const description = `Instance ${instance.instanceName} not found`;
		logWarning(title, description);
	}
}

export function setDefaultInstanceToSolve(): void {
	setInstanceToSolve(0);
}

function setInstanceToSolve(index: number): void {
	const instances: InteractiveInstance[] = get(instanceStore);
	if (checkInstenceIndex(instances, index)) {
		const { summary } = instances[index];
		const { claims } = summary;

		const variables: VariablePool = new VariablePool(summary.varCount);
		const clauses: ClausePool = new ClausePool(fromClaimsToClause(claims.simplified, variables));

		const pools = {
			variables,
			clauses
		};

		const previousProblem = get(problemStore);
		let algorithm = () => console.log('dummy');
		if (previousProblem !== undefined) {
			algorithm = previousProblem.algorithm;
		}

		const problem = { pools, algorithm };

		updateProblem(problem);
		setNonAssignedVariables();
	}
}

function checkInstenceIndex(instances: InteractiveInstance[], index: number): boolean {
	if (instances.length > 0) {
		if (index < 0 || instances.length <= index) {
			logFatal('The instance you are trying to use is not valid');
		}
		return true;
	}
	return false;
}
