import type { BKT_SolverMachine } from './bkt-solver-machine.ts';
import type { BKT_StateMachine } from './bkt-state-machine.ts';

export const initialTransition = (solver: BKT_SolverMachine): void => {
	const stateMachine: BKT_StateMachine = solver.stateMachine;
    console.log(stateMachine);
	//To continue hehe
};
