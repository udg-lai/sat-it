import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

export interface DimacsInstance {
	name: string;
	content: string;
	summary: Summary;
}
