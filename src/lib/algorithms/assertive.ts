import type Clause from '$lib/entities/Clause.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { Lit } from '$lib/types/types.ts';

// Determines if a clause is assertive with respect to a set of literals.
// (including unit propagations and the decided variable).
// A clause is assertive iff it contains exactly one complementary literal \in literals.
export const assertiveAlgorithm = (clause: Clause, literals: Lit[]): boolean => {
	if (literals.length === 0) {
		logFatal(
			'Assertive Algorithm',
			'The set of literals cannot be empty when checking assertiveness'
		);
	}
	let matches = 0;
	let i = 0;
	while (i < literals.length && matches < 2) {
		const lit: Lit = literals[i];
		const complementary: Lit = Literal.complementary(lit);
		if (clause.contains(complementary)) matches += 1;
		i += 1;
	}
	return matches === 1;
};
