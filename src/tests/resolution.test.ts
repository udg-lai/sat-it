import Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { describe, it, expect } from 'vitest';
import Literal from '$lib/transversal/entities/Literal.svelte.ts';
import Clause from '$lib/transversal/entities/Clause.ts';

describe('resolution algorithm', () => {
	const variables = {
		0: new Variable(1),
		1: new Variable(2),
		2: new Variable(3),
		3: new Variable(4),
		4: new Variable(5),
		5: new Variable(6)
	};
	it('example01', () => {
		// clause (1):
		//  [1, -2, -3]
		// clause (2):
		//  [1, -2, -3, 4]
		// resolution:
		//  [1, -2, -3, 4]
		const a = new Literal(variables[0], 'Positive');
		const b = new Literal(variables[1], 'Negative');
		const c = new Literal(variables[2], 'Negative');
		const c1 = new Clause([a, b, c]);

		const d = new Literal(variables[0], 'Positive');
		const e = new Literal(variables[1], 'Negative');
		const f = new Literal(variables[2], 'Negative');
		const g = new Literal(variables[3], 'Positive');
		const c2 = new Clause([d, e, f, g]);

		const c3: Clause = c1.resolution(c2);
	});
});
