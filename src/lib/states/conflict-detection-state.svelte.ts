import type { SvelteSet } from 'svelte/reactivity';
import { getClausePool, getMapping } from './problem.svelte.ts';
import { resetInspectedVariable, setInspectedVariable } from './inspectedVariable.svelte.ts';

let clausesToCheck: number[] = $state([]);
let checkingIndex: number = $state(0);

export function updateClausesToCheck(stateMachineSet: SvelteSet<number>, literal: number) {
	if (stateMachineSet.size === 0) {
		clausesToCheck = [];
		checkingIndex = 0;
	} else {
		const clauses: SvelteSet<number> =
			literal !== 0
				? (getMapping().get(literal) as SvelteSet<number>)
				: getClausePool().getSingleLiteralClauses();
		clausesToCheck = [...clauses];
		checkingIndex = clausesToCheck.length - stateMachineSet.size;
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
