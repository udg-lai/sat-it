import { describe, it, expect } from 'vitest';
import content2summary, { type Summary } from '$lib/transversal/mapping/contentToSummary.ts';

// trivial true clause (1)
// to simplify (2)
const example01 = `
c
c
c start with comments
c
c adios
p cnf 5 3
1 -5 -5 0
-1 5 3 3 0
-3 -4  4 0
`;

// trivial true clause (1)
// to simplify (0)
const example02 = `
p cnf 4 4
-3 -4 0
-1 -2 0
-2 -2 2 0
-1 -2 0
`;

// trivial true clause (3)
// to simplify (1)
const example03 = `
c hola
c
p cnf 4 6
1 -2 4 0
-1 2 3 -3 0
-1 -2 2 4 0
-3 -4 0
c
2 -2 0
c start with comments
-1 -2 3 3 0
c bu
`;

describe('simplification parser', () => {
	it('example01', () => {
		const summary: Summary = content2summary({ name: 'example01', content: example01 });
		const { nTautology, nClauseSimplified } = summary;
		expect(nTautology).toBe(1);
		expect(nClauseSimplified).toBe(2);
	});
	it('example02', () => {
		const summary: Summary = content2summary({ name: 'example02', content: example02 });
		const { nTautology, nClauseSimplified } = summary;
		expect(nTautology).toBe(1);
		expect(nClauseSimplified).toBe(0);
	});
	it('example03', () => {
		const summary: Summary = content2summary({ name: 'example03', content: example03 });
		const { nTautology, nClauseSimplified } = summary;
		expect(nTautology).toBe(3);
		expect(nClauseSimplified).toBe(1);
	});
});
