import { describe, it, expect } from 'vitest';
import content2summary, { type Summary } from '$lib/transversal/mapping/contentToSummary.ts';

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
`;

const example02 = `
p cnf 4 5
1 -2 4 0
-1 2 3 4 0
-3 -4 0
-1 -2 0
-1 -2 3 0
`;

// trivial true clause
const example03 = `
c hola
c
p cnf 4 6
1 -2 4 0
-1 2 3 4 0
-1 -2 2 4 0
-3 -4 0
c
-1 -2 0
c start with comments
-1 -2 3 0
c bu
`;

// repeat literal & trivial true
const example04 = `
c hola
c
p cnf 4 6
1 -2 -2 4 0
-1 2 3 4 0
-1 -2 2 4 0
-3 -4 0
c
-1 -2 0
c start with comments
-1 -2 3 3 0
c bu
`;

// trivial true clause
const example05 = `
c hola
c
p cnf 4 5
1 -2 4 0
-1 2 3 4 0
-1 -2 2 4 0
-3 -4 0
c
-1 -2 0
c start with comments
-1 -2 3 0
c bu
`;

describe('dimacs parser', () => {
	it('example01', () => {
		const summary: Summary = content2summary({ name: 'example01', content: example01 });
		expect(summary.description).toBe(`c\nc\nc start with comments\nc\nc adios`);
		expect(summary.varCount).toBe(5);
		expect(summary.clauseCount).toBe(3);
		expect(summary.claims.map((claim) => claim.clause)).toStrictEqual([
			[1, -5, 4, 0],
			[-1, 5, 3, 4, 0],
			[-3, -4, 0]
		]);
	});
	it('example02', () => {
		const summary: Summary = content2summary({ name: 'example02', content: example02 });
		expect(summary.description).toBe('');
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(5);
		expect(summary.claims.map((claim) => claim.clause)).toStrictEqual([
			[1, -2, 4, 0],
			[-1, 2, 3, 4, 0],
			[-3, -4, 0],
			[-1, -2, 0],
			[-1, -2, 3, 0]
		]);
	});
	it('example03', () => {
		const summary: Summary = content2summary({ name: 'example03', content: example03 });
		expect(summary.description).toBe('c hola\nc');
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(6);
		expect(summary.claims.map((claim) => claim.clause)).toStrictEqual([
			[1, -2, 4, 0],
			[-1, 2, 3, 4, 0],
			[-1, -2, 2, 4, 0],
			[-3, -4, 0],
			[-1, -2, 0],
			[-1, -2, 3, 0]
		]);
		expect(summary.cnf).toStrictEqual([
			[1, -2, 4],
			[-1, 2, 3, 4],
			[-3, -4],
			[-1, -2],
			[-1, -2, 3]
		]);
	});
	it('example04', () => {
		const summary: Summary = content2summary({ name: 'example04', content: example04 });
		expect(summary.description).toBe(`c hola\nc`);
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(6);
		expect(summary.claims.map((claim) => claim.clause)).toStrictEqual([
			[1, -2, -2, 4, 0],
			[-1, 2, 3, 4, 0],
			[-1, -2, 2, 4, 0],
			[-3, -4, 0],
			[-1, -2, 0],
			[-1, -2, 3, 3, 0]
		]);
		expect(summary.cnf).toStrictEqual([
			[1, -2, 4],
			[-1, 2, 3, 4],
			[-3, -4],
			[-1, -2],
			[-1, -2, 3]
		]);
	});
	it('example05', () => {
		expect(() => content2summary({ name: 'example05', content: example05 })).toThrowError();
	});
});
