import dummy from '$lib/dimacs/dummy.ts';
import queens8 from '$lib/dimacs/queens/queens8.ts';
import queens4 from '$lib/dimacs/queens/queens4.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';

function timeout(ms: number): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
}

async function fakeRequest(): Promise<DimacsInstance[]> {
	await timeout(300);
	return [queens4, queens8, dummy];
}

export default async function fetchInstances(): Promise<DimacsInstance[]> {
	const instances = await fakeRequest();
	return instances;
}
