import { logFatal } from '$lib/transversal/logging.ts';
import type { DPLL_STATE_FUN, DPLL_STATE_INPUT } from './dpll/dpll-domain.ts';

export type StateFun = DPLL_STATE_FUN | never;

export type StateInput = DPLL_STATE_INPUT;

export interface FinalState<F extends StateFun>  {
	id: number;
	description: string;
	run?: F;
}

export interface NonFinalState<F extends StateFun, I extends StateInput> {
	id: number;
	description: string;
	run?: F;
	transitions: Map<I, number>;
}

const isFinalState = <F extends StateFun, I extends StateInput>(
	state: State<F, I>
): state is FinalState<F> => {
	return !('transitions' in state);
};

export type State<F extends StateFun, I extends StateInput> = NonFinalState<F, I> | FinalState<F>;

export interface StateMachineInterface<F extends StateFun, I extends StateInput> {
	states: Map<number, State<F, I>>;
	active: number;
	completed: () => boolean;
	getActiveState: () => State<F, I>;
	getNextState: (input: I) => State<F, I>;
	transition: (input: I) => void;
}

export abstract class StateMachine<F extends StateFun, I extends StateInput>
	implements StateMachineInterface<F, I>
{
	states: Map<number, State<F, I>>;
	active: number = $state(-1);

	constructor(states: Map<number, State<F, I>>, initial: number) {
		this.states = states;
		this.active = initial;
	}

	completed(): boolean {
		const activeState = this.getActiveState();
		return isFinalState(activeState);
	}

	getActiveState(): State<F, I> {
		const activeState: State<F, I> | undefined = this.states.get(this.active);
		if (activeState === undefined) {
			logFatal(
				'Error evaluating state machine',
				'Active state not found to know if it is completed'
			);
		}
		return activeState;
	}

	getNextState(input: I): State<F, I> {
		if (this.completed()) {
			logFatal('No next state for a completed state machine');
		} else {
			const activeState = this.getActiveState() as NonFinalState<DPLL_STATE_FUN, DPLL_STATE_INPUT>;
			const activeStateTransitions = activeState.transitions;
			const nextStateId = activeStateTransitions.get(input);
			if (nextStateId === undefined) {
				logFatal('Unexpected input to active state');
			} else {
				const nextState = this.states.get(nextStateId);
				if (nextState === undefined) {
					logFatal('Next state does not appear in set of states by id');
				} else {
					return nextState;
				}
			}
		}
	}

	transition(input: I): void {
		if (this.completed()) {
			logFatal('Already in a final state');
		} else {
			const nextState = this.getNextState(input);
			this.active = nextState.id;
		}
	}
}
