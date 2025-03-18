import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

export interface DimacsInstance {
	instanceName: string;
	content: string;
	summary: Summary;
}
