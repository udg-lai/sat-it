import type { Summary } from '$lib/parsers/dimacs.ts';

export interface DimacsInstance {
	name: string;
	summary: Summary;
}
