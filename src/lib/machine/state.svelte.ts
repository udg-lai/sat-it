import type { Backtracking_StateMachine } from './backtracking/backtracking-machine.ts';
import { DPLL_StateMachine, makeDPLLMachine } from './dpll/dpll-machine.ts';

type AlgStateMachine = DPLL_StateMachine | Backtracking_StateMachine;

const machine: AlgStateMachine = $state(makeDPLLMachine());

export const getStateMachine = (): AlgStateMachine => machine;
