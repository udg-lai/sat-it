import { makeUnresolved, type Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
import { writable, type Writable } from 'svelte/store';

export const previousEval: Writable<Eval> = writable(makeUnresolved());

export function updateEval(e: Eval) {
	previousEval.update(() => {
		return e;
	});
}

export function resetEval() {
	previousEval.set(makeUnresolved());
}
