import { logFatal, logSAT, logUnSAT } from '$lib/stores/toasts.ts';
import type { BKT_FUN, BKT_INPUT } from './backtracking/bkt-domain.svelte.ts';
import type { CDCL_FUN, CDCL_INPUT } from './cdcl/cdcl-domain.svelte.ts';
import type { DPLL_FUN, DPLL_INPUT } from './dpll/dpll-domain.svelte.ts';
import { SAT_STATE_ID, UNSAT_STATE_ID } from './reserved.ts';
import { finalStateControl } from './shared.svelte.ts';

export type StateFun = BKT_FUN | DPLL_FUN | CDCL_FUN | never;

export type StateInput = BKT_INPUT | DPLL_INPUT | CDCL_INPUT;

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
	private preConflict: number = -1;
	private conflict: number = -1;
	private sat: number = -1;
	private unsat: number = -1;

	constructor(
		states: Map<number, State<F, I>>,
		initial: number,
		preConflict: number,
		conflict: number,
		sat: number,
		unsat: number
	) {
		this.states = states;
		this.initial = initial;
		this.active = initial;
		this.preConflict = preConflict;
		this.conflict = conflict;
		this.sat = sat;
		this.unsat = unsat;
	}

	onFinalState(): boolean {
		const activeState = this.getActiveState();
		return isFinalState(activeState);
	}

	onInitialState(): boolean {
		return this.getActiveState().id === this.initial;
	}

	onPreConflictState(): boolean {
		return this.getActiveState().id === this.preConflict;
	}

	onConflictState(): boolean {
		return this.getActiveState().id === this.conflict;
	}

	onUnsatState(): boolean {
		return this.getActiveState().id === UNSAT_STATE_ID;
	}

	onSatState(): boolean {
		return this.getActiveState().id === SAT_STATE_ID;
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
			logFatal(
				'Final state exception',
				'It is not possible to perform a transition in a final state'
			);
		} else {
			const activeState = this.getActiveState() as NonFinalState<F, I>;
			const activeStateTransitions = activeState.transitions;
			const nextStateId = activeStateTransitions.get(input);
			if (nextStateId === undefined) {
				logFatal('Non expected input for the current active state');
			} else {
				const nextState = this.states.get(nextStateId);
				if (nextState === undefined) {
					logFatal('State is not defined in the states mapping');
				} else {
					return nextState;
				}
			}
		}
	}

	transition(input: I): void {
		if (this.onFinalState()) {
			logFatal(
				'Final state exception',
				'It is not possible to perform a transition in a final state'
			);
		} else {
			const nextState = this.getNextState(input);
			this.active = nextState.id;
			if (this.onFinalState()) {
				finalStateControl();
				this.notifyFinalState();
			}
		}
	}

	private notifyFinalState(): void {
		const stateId = this.getActiveState().id;
		if (stateId === this.sat) {
			logSAT('Problem satisfied, model found.');
		} else if (stateId === this.unsat) {
			logUnSAT('Problem unsatisfied, no model found.');
		}
	}
}
