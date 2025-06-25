import type { Summary } from '$lib/transversal/parsers/dimacs.ts';

export interface DimacsInstance {
	name: string;
	summary: Summary;
}
