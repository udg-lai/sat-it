import pb from '$lib/instances/pb.ts';
import queens3 from '$lib/instances/queens/queens3.ts';
import queens4 from '$lib/instances/queens/queens4.ts';
import logarithmic from '$lib/instances/logarithmic.ts';
import unsatback from '$lib/instances/unsatback.ts'
import unsatdpll from '$lib/instances/unsatdpll.ts'
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';

function timeout(ms: number): Promise<void> {
	return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
}

async function fakeRequest(): Promise<DimacsInstance[]> {
	await timeout(300);
	return [pb, queens3, queens4, logarithmic, unsatback, unsatdpll];
}

export default async function fetchInstances(): Promise<DimacsInstance[]> {
	const instances = await fakeRequest();
	return instances;
}
