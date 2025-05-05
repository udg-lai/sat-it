import type { Summary } from '$lib/transversal/mapping/contentToSummary.ts';

export interface DimacsInstance {
	name: string;
	content: string;
	summary: Summary;
	html?: string[];
}
