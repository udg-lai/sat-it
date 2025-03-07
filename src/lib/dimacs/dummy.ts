import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'dummy.dimacs';

const content = `
p cnf 3 2
1 2 -3 0
-2 3 0
`;

const instance: DimacsInstance = { fileName, content };

export default instance;
