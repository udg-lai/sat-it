import { DPLL_SolverStateMachine, makeDPLLSolver } from '$lib/machine/dpll/dpll-solver.ts';
import { SolverStateMachine } from '$lib/machine/SolverStateMachine.ts';
import type { StateFun, StateInput } from '$lib/machine/StateMachine.ts';
import { logFatal } from '$lib/transversal/logging.ts';

let solverStateMachine: SolverStateMachine<StateFun, StateInput> = $state(
	new DPLL_SolverStateMachine()
);

export const setSolverStateMachine = (algorithm: 'backtracking' | 'dpll' | 'cdcl') => {
	if (algorithm === 'backtracking') {
		solverStateMachine = makeDPLLSolver();
	} else if (algorithm === 'dpll') {
		solverStateMachine = makeDPLLSolver();
	} else if (algorithm === 'cdcl') {
		solverStateMachine = makeDPLLSolver();
	} else {
		logFatal('No SolverStateMachine was creted');
	}
};

export const updateSolverStateMachine = (activeState: number): void => {
	solverStateMachine.stateMachine.active = activeState;
};

export const getSolverStateMachine = () => solverStateMachine;
