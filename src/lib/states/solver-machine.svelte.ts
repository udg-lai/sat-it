import { makeBKTSolver } from '$lib/solvers/backtracking/bkt-solver-machine.svelte.ts';
import { makeCDCLSolver } from '$lib/solvers/cdcl/cdcl-solver-machine.svelte.ts';
import { makeDPLLSolver } from '$lib/solvers/dpll/dpll-solver-machine.svelte.ts';
import { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
import { makeTWATCHSolver } from '$lib/solvers/twatch/twatch-solver-machine.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { type Algorithm } from '$lib/types/algorithm.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(makeTWATCHSolver());

export const stopSolverMachine = () => {
	// This function stops the current solver machine if it's running
	solverMachine.stop();
};

export const activateSolverMachine = (algorithm: Algorithm): void => {
	if (algorithm === 'backtracking') {
		solverMachine = makeBKTSolver();
	} else if (algorithm === 'dpll') {
		solverMachine = makeDPLLSolver();
	} else if (algorithm === 'cdcl') {
		solverMachine = makeCDCLSolver();
	} else if (algorithm === 'twatch') {
		solverMachine = makeTWATCHSolver();
	} else {
		logFatal('No SolverStateMachine was created');
	}
};

export const getSolverMachine = (): SolverMachine<StateFun, StateInput> => solverMachine;
