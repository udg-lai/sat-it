import parseDimacs from '$lib/parsers/dimacs.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'satback.dimacs';

const content = `
p cnf 2 3
1 -2 0
-1 2 0
-1 -2 0
`;

const summary = parseDimacs(content);

const instance: DimacsInstance = {
	name: fileName.toLowerCase(),
	summary
};

export default instance;
