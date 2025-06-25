import {
	BKT_SolverMachine,
	makeBKTSolver
} from '$lib/solvers/backtracking/bkt-solver-machine.svelte.ts';
import { makeCDCLSolver } from '$lib/solvers/cdcl/cdcl-solver-machine.svelte.ts';
import { makeDPLLSolver } from '$lib/solvers/dpll/dpll-solver-machine.svelte.ts';
import { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { getProblemStore, type Algorithm } from './problem.svelte.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(new BKT_SolverMachine());

export const setSolverStateMachine = () => {
	if (solverMachine) {
		solverMachine.stopAutoMode();
	}
	const algorithm: Algorithm = getProblemStore().algorithm;
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
	solverMachine.updateActiveStateId(stateId);
	solverMachine.updateFromRecord(record);
};

export const getSolverMachine = () => solverMachine;
