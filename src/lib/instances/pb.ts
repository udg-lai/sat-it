import parseDimacs from '$lib/parsers/dimacs.ts';
import type { DimacsInstance } from './dimacs-instance.interface.ts';

const fileName = 'pb.dimacs';

const content = `
p cnf 12 15
c unitary clauses
5 0
-11 0
12 0
c node vr
6 -1 -5 0
7 -5 0
c node v2
8 -2 -6 0
9 -6 0
c node v3
10 -2 -7 0
9 -7 0
c node v4
11 -3 -8 0
10 -8 0
c node v5
10 -3 -9 0
12 -9 0
c node v6
11 -4 -10 0
12 -10 0
`;

const summary = parseDimacs(content);

const instance: DimacsInstance = {
	name: fileName.toLowerCase(),
	summary
};

export default instance;
