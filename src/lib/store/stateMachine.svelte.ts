import { DPLL_SolverMachine, makeDPLLSolver } from '$lib/machine/dpll/dpll-solver-machine.ts';
import { SolverMachine } from '$lib/machine/SolverMachine.ts';
import type { StateFun, StateInput } from '$lib/machine/StateMachine.ts';
import { logFatal } from '$lib/transversal/logging.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(new DPLL_SolverMachine());

export const setSolverStateMachine = (algorithm: 'backtracking' | 'dpll' | 'cdcl') => {
	if (algorithm === 'backtracking') {
		solverMachine = makeDPLLSolver();
	} else if (algorithm === 'dpll') {
		solverMachine = makeDPLLSolver();
	} else if (algorithm === 'cdcl') {
		solverMachine = makeDPLLSolver();
	} else {
		logFatal('No SolverStateMachine was created');
	}
};

export const updateSolverMachine = (stateId: number): void => {
	solverMachine.updateActiveState(stateId);
};

export const getSolverMachine = () => solverMachine;
