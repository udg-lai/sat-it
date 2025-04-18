export const isTautology = (clause: Set<number>): boolean => {
	let tautology = false;
	for (const lit of clause) {
		if (clause.has(lit * -1)) {
			tautology = true;
			break;
		}
	}
	return !tautology;
};
