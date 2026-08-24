import type Clause from '$lib/entities/Clause.svelte.ts';
import Literal from '$lib/entities/Literal.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';

// This function is used in the conflict analysis to determine
// if a clause is assertive, with respect to the literals of the last decision level (including the decision literal).
// A clause is assertive iff it contains exactly one variable not violated by the assignments of
// the last decision level.

// If the clause is assertive it returns the non violated literal by the assignment, otherwise nothing
export const getUIPAlgorithm = (clause: Clause, dlAssignments: Lit[]): Maybe<Lit> => {
	if (dlAssignments.length === 0) {
		logFatal('First UIP Algorithm', 'The set of literals cannot be empty when checking first UIP');
	}
	let matches = 0;
	let i = 0;
	let uipLiteral: Maybe<Lit> = makeNothing();
	while (i < dlAssignments.length && matches < 2) {
		const assignment: Lit = dlAssignments[i];
		const complementary: Lit = Literal.complementary(assignment);
		if (clause.contains(complementary)) {
			matches += 1;
			uipLiteral = makeJust(complementary);
		}
		i += 1;
	}

	const uip = matches === 1;

	if (uip) return uipLiteral;
	else return makeNothing();
};
