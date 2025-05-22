import type { BKT_SolverMachine } from './bkt-solver-machine.svelte.ts';
import type { BKT_StateMachine } from './bkt-state-machine.svelte.ts';

export const initialTransition = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
	console.log(stateMachine);
	//To continue hehe
};
