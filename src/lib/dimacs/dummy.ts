import claims2html from '$lib/transversal/mapping/claimsToHtml.ts';
import content2summary from '$lib/transversal/mapping/contentToSummary.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'dummy.dimacs';

const content = `
p cnf 3 2
c this is just a dummy example
1 2 -3 0
c this is added here
-2 3 0
`;

const summary = content2summary({ content, name: fileName.toLowerCase() });

const instance: DimacsInstance = {
	name: fileName.toLowerCase(),
	content,
	summary,
	html: claims2html(summary.claims)
};

export default instance;
