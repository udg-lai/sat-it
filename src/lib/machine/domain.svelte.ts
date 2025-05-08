import type { DPLL_ALGORITHM, DPLL_INPUT } from './dpll/dpll-domain.ts';

export type StateFun = DPLL_ALGORITHM;

export type StateInput = DPLL_INPUT;

export interface State<F extends StateFun> {
	algorithm: F;
}

export interface NonFinalState<I extends StateInput, F extends StateFun> extends State<F> {
	neighbor: Map<I, State<F>>;
}

export interface Machine {
	states: Map<number, State<StateFun> | NonFinalState<StateInput, StateFun>>;
	active: number;
}
