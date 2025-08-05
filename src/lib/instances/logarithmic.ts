import parseDimacs from '$lib/parsers/dimacs.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'logarithmic.dimacs';

const content = `
p cnf 9 18
c at most one among 1,2,..6, log encoding
-1 -7 0
-1 -8 0
-1 -9 0
-2 -7 0
-2 -8 0
-2 9 0
-3 -7 0
-3 8 0
-3 -9 0
-4 -7 0
-4 8 0
-4 9 0
-5 7 0
-5 -8 0
-5 -9 0
-6 7 0
-6 -8 0
-6 9 0
`;

const summary = parseDimacs(content);

const instance: DimacsInstance = {
	name: fileName.toLowerCase(),
	summary
};

export default instance;
