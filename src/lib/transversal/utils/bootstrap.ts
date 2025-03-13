import { setContext } from 'svelte';
import dummy from '$lib/dimacs/dummy.ts';
import queens8 from '$lib/dimacs/queens/queens8.ts';
import queens4 from '$lib/dimacs/queens/queens4.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { logError } from './logging.ts';

export const BOOSTRAP_INSTANCES_CTX_KEY = "boostrapInstances";

export function bootstrapInstances(): void {
	try {
		const instances: DimacsInstance[] = [dummy, queens4, queens8];
		setContext(BOOSTRAP_INSTANCES_CTX_KEY, instances);
	} catch (e) {
		const title = 'Pre-loaded dimacs instance contains an error';
		const description = (e as Error).message;
		logError(title, description);
	}
}
