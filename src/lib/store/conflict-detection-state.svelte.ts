import type { SvelteSet } from 'svelte/reactivity';

let clausesToCheck: number[] = $state([]);
let checkingIndex: number = $state(0);

export function updateClausesToCheck(toCheck: SvelteSet<number>) {
	checkingIndex = 0;
	clausesToCheck = [...toCheck];
}

export const getClausesToCheck = () => clausesToCheck;

export const getCheckingIndex = () => checkingIndex;

export const incrementCheckingIndex = () => {
	if (checkingIndex < clausesToCheck.length - 1) {
		checkingIndex++;
	}
};
