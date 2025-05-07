import type { Machine } from './domain.svelte.ts';
import { makeDPLLMachine } from './dpll/dpll-machine.ts';

export const getStateMachine = () => machine;

export const getCurrentState = () => {
	const { active, states } = machine;
	return states.get(active);
};

export const makeMachine = (machine: 'backtracking' | 'pdll' | 'cdcl'): Machine => {
	return makeDPLLMachine();
};

let machine: Machine = $state(makeMachine('pdll'));
