import type { DPLL_ALGORITHM, DPLL_INPUT } from './dpll/dpll-domain.ts';

type StateFun = DPLL_ALGORITHM;

type StateInput = DPLL_INPUT;

export interface State<F extends StateFun> {
	algorithm: F;
}

export interface NonFinalState<I extends StateInput, F extends StateFun> extends State<F> {
	neighbor: Map<I, State<F>>;
}

const states: Map<number, State<StateFun>> = new Map();

let id = 0;

export const addState = <F extends StateFun>(state: State<F>): Map<number, State<StateFun>> => {
	states.set(id, state);
	id += 1;
	return states;
};
