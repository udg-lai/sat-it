import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import VariablePool from '$lib/transversal/entities/VariablePool.ts';
import fetchInstances from '$lib/transversal/utils/bootstrap-instances.ts';
import { logError, logFatal, logWarning } from '$lib/transversal/utils/logging.ts';
import { fromClaimsToClause } from '$lib/transversal/utils/utils.ts';
import { get, writable, type Writable } from 'svelte/store';
import { problemStore, updateProblem } from './problem.store.ts';

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
	let instances = get(instanceStore);

	if (instances.length === 0) {
		logError("Can not set default instance from an empty set")
	} 
	else {
		instances = instances.map((i) => {
			return { ...i, active: false }
		})
		const instance: InteractiveInstance = instances[0];
		instance.active = true;
		updateInstanceStore(instances);
		updateActiveInstanceStore(instance)
		updateProblem()
	}
}


function updateInstanceStore(newInstances: InteractiveInstance[]): void {
	instanceStore.set(newInstances);
}

export function updateActiveInstanceStore(instance: InteractiveInstance): void {
	activeInstanceStore.set(instance);
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


function updateProblem(dimacsInstance: InteractiveInstance): void {
	const { summary } = dimacsInstance;
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
}
