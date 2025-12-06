import { getConfiguredAlgorithm } from '$lib/components/settings/engine/state.svelte.ts';
import { makeBKTSolver } from '$lib/solvers/backtracking/bkt-solver-machine.svelte.ts';
import { makeCDCLSolver } from '$lib/solvers/cdcl/cdcl-solver-machine.svelte.ts';
import { makeDPLLSolver } from '$lib/solvers/dpll/dpll-solver-machine.svelte.ts';
import { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { type Algorithm } from '$lib/types/algorithm.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(makeCDCLSolver());

export const stopSolverMachine = () => {
	// This function stops the current solver machine if it's running
	solverMachine.stop();
};

export const syncSolverMachineWithConfig = () => {
	const algorithm: Algorithm = getConfiguredAlgorithm();

	if (algorithm === 'backtracking') {
		solverMachine = makeBKTSolver();
	} else if (algorithm === 'dpll') {
		solverMachine = makeDPLLSolver();
	} else if (algorithm === 'cdcl') {
		solverMachine = makeCDCLSolver();
	} else {
		logFatal('No SolverStateMachine was created');
	}
};

export const updateSolverMachine = (
	stateId: number,
	record: Record<string, unknown> | undefined
): void => {
	solverMachine.stop();
	solverMachine.updateActiveStateId(stateId);
	solverMachine.updateFromRecord(record);
};

export const getSolverMachine = () => solverMachine;
