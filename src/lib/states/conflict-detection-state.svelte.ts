import type { CRef, Lit } from '$lib/types/types.ts';
import { resetInspectedVariable, setInspectedVariable } from './inspectedVariable.svelte.ts';
import { getClausePool, getOccurrencesTableMapping } from './problem.svelte.ts';

let clausesToCheck: number[] = $state([]);
let checkingIndex: number = $state(0);

export function updateClausesToCheck(occurrenceList: Set<CRef>, literal: Lit): void {
	if (occurrenceList.size === 0) {
		clausesToCheck = [];
		checkingIndex = 0;
	} else {
		const clauses: Set<CRef> =
			literal !== 0
				? (getOccurrencesTableMapping().get(literal) as Set<CRef>)
				: getClausePool().getSingleLiteralClauses();
		clausesToCheck = [...clauses];
		checkingIndex = clausesToCheck.length - occurrenceList.size;
	}
	setInspectedVariable(Math.abs(literal));
}

export const cleanClausesToCheck = () => {
	clausesToCheck = [];
	checkingIndex = 0;
	resetInspectedVariable();
};

export const getClausesToCheck = () => clausesToCheck;

export const getCheckingIndex = () => checkingIndex;

export const incrementCheckingIndex = () => {
	if (checkingIndex < clausesToCheck.length - 1) {
		checkingIndex++;
	}
};

export const getCheckedClause = () => clausesToCheck[checkingIndex];
