import type { SvelteSet } from 'svelte/reactivity';
import { getClausePool, getMapping } from './problem.svelte.ts';

let inspectedLiteral: number = $state(0);
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
				: getClausePool().getUnitClauses();
		clausesToCheck = [...clauses];
		checkingIndex = clausesToCheck.length - stateMachineSet.size;
	}
	inspectedLiteral = literal;
}

export const getInspectedVariable = () => Math.abs(inspectedLiteral);

export const getClausesToCheck = () => clausesToCheck;

export const getCheckingIndex = () => checkingIndex;

export const incrementCheckingIndex = () => {
	if (checkingIndex < clausesToCheck.length - 1) {
		checkingIndex++;
	}
};

export const getCheckedClause = () => clausesToCheck[checkingIndex];
