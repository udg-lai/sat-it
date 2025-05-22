import {
	BKT_SolverMachine,
	makeBKTSolver
} from '$lib/machine/backtracking/bkt-solver-machine.svelte.ts';
import { makeDPLLSolver } from '$lib/machine/dpll/dpll-solver-machine.svelte.ts';
import { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
import { logFatal } from '$lib/transversal/logging.ts';

let solverMachine: SolverMachine<StateFun, StateInput> = $state(new BKT_SolverMachine());

export const setSolverStateMachine = (algorithm: 'backtracking' | 'dpll' | 'cdcl') => {
	if (algorithm === 'backtracking') {
		solverMachine = makeBKTSolver();
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
