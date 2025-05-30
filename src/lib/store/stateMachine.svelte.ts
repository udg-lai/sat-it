import {
	DPLL_SolverMachine,
	makeDPLLSolver
} from '$lib/machine/dpll/dpll-solver-machine.svelte.ts';
import { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import { getProblemStore, type Algorithm } from './problem.svelte.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(new DPLL_SolverMachine());

export const setSolverStateMachine = () => {
	const algorithm: Algorithm = getProblemStore().algorithm;
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

export const updateSolverMachine = (
	stateId: number,
	record: Record<string, unknown> | undefined
): void => {
	solverMachine.updateActiveStateId(stateId);
	solverMachine.updateFromRecord(record);
};

export const getSolverMachine = () => solverMachine;
