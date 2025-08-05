import parseDimacs from '$lib/parsers/dimacs.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'unsatdpll.dimacs';

const content = `
p cnf 5 7
3 4 -1 5 0
-3 4 5 0
3 -4 -1 0
1 2 0
1 -2 0
-1 -5 0
-3 -4 5 0
`;

const summary = parseDimacs(content);

const instance: DimacsInstance = {
	name: fileName.toLowerCase(),
	summary
};

export default instance;
