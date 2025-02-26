import { describe, it, expect } from 'vitest';
import parser from '$lib/transversal/utils/dimacs.ts';


const example01 = `
c
c
c start with comments
c
c adios
p cnf 5 3
1 -5 4 0
-1 5 3 4 0
-3 -4 0
`

const example02 = `
p cnf 5 3
1 -5 4 0
-1 5 3 4 0
-3 -4 0
`

describe('dimacs parser', () => {
    it('example01', () => {
        const summary = parser(example01)
        expect(summary.comment).toBe(`\n\nstart with comments\n\nadios\n`);
    });
});
