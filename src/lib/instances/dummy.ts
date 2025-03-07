import type { InstanceDimacs } from "./InstanceDimacs.ts";


const fileName = 'dummy.dimacs';

const content = `
p cnf 3 2
1 2 -3 0
-2 3 0
`;

const instance: InstanceDimacs = { fileName, content };

export default instance;
