import { describe, it, expect } from 'vitest';
import parser, { type Summary } from '$lib/transversal/utils/dimacs.ts';

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

const example03 = `
c hola
c
p cnf 4 5
1 -2 4 0
-1 2 3 4 0
-3 -4 0
c
-1 -2 0
c start with comments
-1 -2 3 0
c bu
`;

describe('dimacs parser', () => {
	it('example01', () => {
		const summary: Summary = parser(example01);
		expect(summary.comment).toBe(`\n\nstart with comments\n\nadios\n`);
		expect(summary.varCount).toBe(5);
		expect(summary.clauseCount).toBe(3);
		expect(summary.claims).toStrictEqual([
			[1, -5, 4, 0],
			[-1, 5, 3, 4, 0],
			[-3, -4, 0]
		]);
	});
	it('example02', () => {
		const summary: Summary = parser(example02);
		expect(summary.comment).toBe('');
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(5);
		expect(summary.claims).toStrictEqual([
			[1, -2, 4, 0],
			[-1, 2, 3, 4, 0],
			[-3, -4, 0],
			[-1, -2, 0],
			[-1, -2, 3, 0]
		]);
	});
	it('example03', () => {
		const summary: Summary = parser(example03);
		expect(summary.comment).toBe(`hola\n\n\nstart with comments\nbu\n`);
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(5);
		expect(summary.claims).toStrictEqual([
			[1, -2, 4, 0],
			[-1, 2, 3, 4, 0],
			[-3, -4, 0],
			[-1, -2, 0],
			[-1, -2, 3, 0]
		]);
	});
});
