import dummy from '$lib/instances/dummy.ts';
import queens8 from '$lib/instances/queens/queens8.ts';
import queens4 from '$lib/instances/queens/queens4.ts';
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';

function timeout(ms: number): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
}

async function fakeRequest(): Promise<DimacsInstance[]> {
	await timeout(300);
	return [dummy, queens4, queens8];
}

export default async function fetchInstances(): Promise<DimacsInstance[]> {
	const instances = await fakeRequest();
	return instances;
}
