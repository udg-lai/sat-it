import type Literal from '$lib/entities/Literal.svelte.ts';
import TemporalClause from '$lib/entities/TemporalClause.ts';

export default function logicResolution(c1: TemporalClause, c2: TemporalClause): TemporalClause {
	const resolvedLiterals: Map<number, Literal> = new Map();

	//We need to do this as it follows as the ids of each literal are unique
	for (const lit of c1) {
		resolvedLiterals.set(lit.toInt(), lit.copy());
	}

	let foundComplementary = false;
	for (const lit of c2) {
		const litId = lit.toInt();
		// drops only the first complementary
		if (resolvedLiterals.has(litId * -1) && !foundComplementary) {
			resolvedLiterals.delete(litId * -1);
			foundComplementary = true;
		} // only adds if it does not exist the literal expressed as natural in the collection
		else if (!resolvedLiterals.has(litId)) {
			//In case the literals is not inside the resolved clause, we add it
			resolvedLiterals.set(litId, lit.copy());
		}
	}
	return new TemporalClause(Array.from(resolvedLiterals.values()));
}
