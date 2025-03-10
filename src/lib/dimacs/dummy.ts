import dimacsParser from '$lib/transversal/utils/parsers/dimacs.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'dummy.dimacs';

const content = `
p cnf 3 2
1 2 -3 0
-2 3 0
`;

const summary = dimacsParser(content);

const instance: DimacsInstance = { fileName, content, summary };

export default instance;
