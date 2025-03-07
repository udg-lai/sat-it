import type { Summary } from '$lib/transversal/utils/parsers/dimacs.ts';

export interface DimacsInstance {
	fileName: string;
	content: string;
	summary: Summary;
}
