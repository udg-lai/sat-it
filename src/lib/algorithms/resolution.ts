import Clause from '$lib/entities/Clause.svelte.ts';
import type Literal from '$lib/entities/Literal.svelte.ts';

export default function logicResolution(c1: Clause, c2: Clause): Clause {
	const resolvedLiterals: Map<number, Literal> = new Map();

	//The first clause literals are inserted in the map.
	for (const lit of c1) {
		resolvedLiterals.set(lit.toInt(), lit);
	}

	let foundComplementary = false;
	for (const lit of c2) {
		const litId = lit.toInt();
		// Only the first complementary is dropped.
		if (resolvedLiterals.has(litId * -1) && !foundComplementary) {
			resolvedLiterals.delete(litId * -1);
			foundComplementary = true;
		} // In case the literal is not inside the resolved clause, it is added.
		else if (!resolvedLiterals.has(litId)) {
			resolvedLiterals.set(litId, lit);
		}
	}
	return new Clause(Array.from(resolvedLiterals.values()));
}
