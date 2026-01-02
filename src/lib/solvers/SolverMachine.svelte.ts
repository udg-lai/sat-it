import { solverSignalEventBus, type SolverCommand } from '$lib/events/events.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { State, StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';

export type KnownSolver = 'bkt' | 'dpll' | 'cdcl';

export interface SolverStateInterface<F extends StateFun, I extends StateInput> {
	transitionByEvent: (input: SolverCommand) => Promise<void>;
	transition: (input: I) => void;
	getActiveStateId: () => number;
	updateActiveStateId: (id: number) => void;
	getActiveState: () => State<F, I>;
	runningOnAutomatic: () => boolean;
	stopRunningOnAutomatic: () => void;
	onConflictState: () => boolean;
	onInitialState: () => boolean;
	onFinalState: () => boolean;
	onDetectingConflict: () => boolean;
	identify: () => KnownSolver;
	getStateMachine: () => StateMachine<F, I>;
	updateStepDelayMS: (ms: number) => void;
	disableStepDelay(): void;
	stop(): void;
}

export abstract class SolverMachine<F extends StateFun, I extends StateInput>
	implements SolverStateInterface<F, I>
{
	protected stateMachine!: StateMachine<F, I>;
	private runningOnAuto: boolean = $state(false);
	private forcedStop: boolean = $state(false);
	private solverId: KnownSolver = $state('bkt');
	private stepDelayMS: number = 0;

	constructor(stateMachine: StateMachine<F, I>, solverId: KnownSolver, stepDelayMS: number = 0) {
		this.stateMachine = stateMachine;
		this.runningOnAuto = false;
		this.forcedStop = false;
		this.solverId = solverId;
		this.stepDelayMS = stepDelayMS;
	}

	updateStepDelayMS(delayMS: number): void {
		this.stepDelayMS = Math.max(0, delayMS);
	}

	disableStepDelay(): void {
		this.updateStepDelayMS(0);
	}

	runningOnAutomatic(): boolean {
		return this.runningOnAuto;
	}

	getStateMachine(): StateMachine<F, I> {
		return this.stateMachine;
	}

	getActiveStateId(): number {
		return this.stateMachine.getActiveId();
	}

	updateActiveStateId(id: number): void {
		this.stateMachine.setActiveId(id);
	}

	getActiveState(): State<F, I> {
		return this.stateMachine.getActiveState();
	}

	// Every node in the UP + conflict detection block except the conflict state
	abstract onDetectingConflict(): boolean;

	onConflictState(): boolean {
		return this.stateMachine.onConflictState();
	}

	onDecisionState(): boolean {
		return this.stateMachine.onDecisionState();
	}

	onUnsatState(): boolean {
		return this.stateMachine.onUnsatState();
	}

	onSatSate(): boolean {
		return this.stateMachine.onSatState();
	}

	onFinalState(): boolean {
		return this.stateMachine.onFinalState();
	}

	onInitialState(): boolean {
		return this.stateMachine.onInitialState();
	}

	stop(): void {
		if (this.runningOnAutomatic()) {
			this.stopRunningOnAutomatic();
		}
	}

	stopRunningOnAutomatic(): void {
		this.forcedStop = true;
	}

	identify(): KnownSolver {
		return this.solverId;
	}

	transition(input: I): void {
		this.stateMachine.transition(input);
	}

	async transitionByEvent(input: SolverCommand): Promise<void> {
		if (input === 'step') {
			this._step();
		} else if (input === 'nextVariable') {
			await this.solveToNextVariableStepByStep();
		} else if (input === 'finishCD') {
			await this.solveCDStepByStep();
		} else if (input === 'solve_trail') {
			await this.solveTrailStepByStep();
		} else if (input === 'automatic_steps' || input === 'solve_all') {
			await this.solveAllStepByStep();
		} else if (input === 'nextDecision') {
			await this.propagate();
		} else if (input === 'branching') {
			await this.branching();
		} else {
			logFatal('Transition By Event Error', `Unknown event ${input} for solver machine`);
		}
	}

	protected abstract step(): void;

	private _step(): void {
		solverSignalEventBus.emit('begin-step');
		this.step();
		solverSignalEventBus.emit('finish-step');
	}

	protected async automaticStepByStep(continueCond: () => boolean): Promise<void> {
		// Once solver started running on automatic mode it should finish.
		// So, it cannot be interrupted by another automatic run.
		if (this.runningOnAutomatic()) {
			console.warn('Solver is already running in automatic mode.');
			return;
		}
		this._preAutomaticStepByStep();
		try {
			// Transition the state machine while the continue condition is true
			while (!this.forcedStop && !this.onFinalState() && continueCond()) {
				this._step();
				if (this.stepDelayMS > 0) {
					const promise = new Promise<void>((resolve) => setTimeout(resolve, this.stepDelayMS));
					await promise;
				}
			}
		} finally {
			this._postAutomaticStepByStep();
		}
	}

	private _preAutomaticStepByStep(): void {
		this.setFlagsPreAuto();
		solverSignalEventBus.emit('begin-step-by-step');
	}

	private _postAutomaticStepByStep(): void {
		this.setFlagsPostAuto();
		solverSignalEventBus.emit('finish-step-by-step');
	}

	protected async solveAllStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => !this.onFinalState());
	}

	protected async solveTrailStepByStep(): Promise<void> {
		await this.automaticStepByStep(() => !this.onConflictState() && !this.onFinalState());
	}

	protected abstract solveToNextVariableStepByStep(): Promise<void>;

	protected abstract solveCDStepByStep(): Promise<void>;

	protected async branching(): Promise<void> {
		if (!this.onDecisionState()) {
			logFatal('Branching Error', 'Not in a decision state to perform branching');
		}
		this._step(); // Execute decision
		await this.propagate(); // Propagate until next decision or final state
	}

	// Propagate until next decision or final state
	protected async propagate(): Promise<void> {
		await this.automaticStepByStep(() => !this.onDecisionState() && !this.onFinalState());
	}

	private setFlagsPreAuto(): void {
		this.forcedStop = false;
		this.runningOnAuto = true;
	}

	private setFlagsPostAuto(): void {
		this.runningOnAuto = false;
	}
}
