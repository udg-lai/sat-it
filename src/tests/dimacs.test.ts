import { describe, it, expect } from 'vitest';
import parseDimacs, { type Summary } from '$lib/parsers/dimacs.ts';

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

// unsupported literal
const example05 = `
c hola
c
p cnf 4 5
1 -2 4 0
-1 2 3 44 0
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
		const summary: Summary = parseDimacs(example01);
		expect(summary.comments).toStrictEqual(['c', 'c', 'c start with comments', 'c', 'c adios']);
		expect(summary.varCount).toBe(5);
		expect(summary.clauseCount).toBe(3);
		expect(summary.claims.map((claim) => claim.literals)).toStrictEqual([
			[1, -5, 4],
			[-1, 5, 3, 4],
			[-3, -4]
		]);
	});
	it('example02', () => {
		const summary: Summary = parseDimacs(example02);
		expect(summary.comments).toStrictEqual([]);
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(5);
		expect(summary.claims.map((claim) => claim.literals)).toStrictEqual([
			[1, -2, 4],
			[-1, 2, 3, 4],
			[-3, -4],
			[-1, -2],
			[-1, -2, 3]
		]);
	});
	it('example03', () => {
		const summary: Summary = parseDimacs(example03);
		expect(summary.comments).toStrictEqual(['c hola', 'c']);
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(6);
		expect(summary.claims.map((claim) => claim.literals)).toStrictEqual([
			[1, -2, 4],
			[-1, 2, 3, 4],
			[-3, -4],
			[-1, -2],
			[-1, -2, 3]
		]);
	});
	it('example04', () => {
		const summary: Summary = parseDimacs(example04);
		expect(summary.comments).toStrictEqual(['c hola', 'c']);
		expect(summary.varCount).toBe(4);
		expect(summary.clauseCount).toBe(6);
		expect(summary.claims.map((claim) => claim.literals)).toStrictEqual([
			[1, -2, 4],
			[-1, 2, 3, 4],
			[-3, -4],
			[-1, -2],
			[-1, -2, 3]
		]);
	});
	it('example05', () => {
		expect(() => parseDimacs(example05)).toThrowError();
	});
});
