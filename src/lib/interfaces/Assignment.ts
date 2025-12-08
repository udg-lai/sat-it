import type { Var } from '$lib/types/types.ts';

export interface Assignment {
	variable: Var;
	polarity: boolean | undefined;
}
