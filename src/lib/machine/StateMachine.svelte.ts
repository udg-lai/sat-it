import { logFatal } from '$lib/transversal/logging.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll/dpll-domain.svelte.ts';
import { UNSAT_STATE_ID } from './reserved.ts';

export type StateFun = DPLL_FUN | never;

export type StateInput = DPLL_INPUT;

export interface FinalState<F extends StateFun> {
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
	getActiveId: () => number;
	setActiveId: (id: number) => void;
	getActiveState: () => State<F, I>;
	getNextState: (input: I) => State<F, I>;
	transition: (input: I) => void;
	onFinalState: () => boolean;
	onInitialState: () => boolean;
	onConflictState: () => boolean;
}

export abstract class StateMachine<F extends StateFun, I extends StateInput>
	implements StateMachineInterface<F, I>
{
	private states: Map<number, State<F, I>>;
	private active: number = $state(-1);
	private initial: number = -1;
	private conflict: number = -1;

	constructor(states: Map<number, State<F, I>>, initial: number, conflict: number) {
		this.states = states;
		this.initial = initial;
		this.active = initial;
		this.conflict = conflict;
	}

	onFinalState(): boolean {
		const activeState = this.getActiveState();
		return isFinalState(activeState);
	}

	onInitialState(): boolean {
		return this.getActiveState().id === this.initial;
	}

	onConflictState(): boolean {
		return this.getActiveState().id === this.conflict;
	}

	onUnsatState(): boolean {
		return this.getActiveState().id === UNSAT_STATE_ID;
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

	getActiveId(): number {
		return this.active;
	}

	setActiveId(id: number): void {
		this.active = id;
	}

	getNextState(input: I): State<F, I> {
		if (this.onFinalState()) {
			logFatal('No next state for a completed state machine');
		} else {
			const activeState = this.getActiveState() as NonFinalState<DPLL_FUN, DPLL_INPUT>;
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
		if (this.onFinalState()) {
			logFatal('Already in a final state');
		} else {
			const nextState = this.getNextState(input);
			this.active = nextState.id;
		}
	}
}
