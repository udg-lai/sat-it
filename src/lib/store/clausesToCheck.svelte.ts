import { SvelteSet } from 'svelte/reactivity';

let clausesToCheck: SvelteSet<number> = $state(new SvelteSet<number>());

export function updateClausesToCheck(toCheck: SvelteSet<number>) {
	clausesToCheck = toCheck;
}

export const getClausesToCheck = () => clausesToCheck;
