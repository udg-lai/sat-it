import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';

let focusedAssignment: Maybe<Lit> = $state(makeNothing());

export const focusOnAssignment = (lit: Lit): void => {
	focusedAssignment = makeJust(lit);
};

export const wipeFocusAssignment = (): void => {
	focusedAssignment = makeNothing();
}

export const getFocusedAssignment = (): Maybe<Lit> => focusedAssignment;