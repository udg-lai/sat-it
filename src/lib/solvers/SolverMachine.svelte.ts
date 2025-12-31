import {
	solverFinishedAutoMode,
	solverStartedAutoMode,
	stateMachineLifeCycleEventBus,
	type StateMachineEvent
} from '$lib/events/events.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import { tick } from 'svelte';
import type { State, StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';

export type KnownSolver = 'bkt' | 'dpll' | 'cdcl';

export interface SolverStateInterface<F extends StateFun, I extends StateInput> {
	transitionByEvent: (input: StateMachineEvent) => Promise<void>;
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
	updateStopTimeout: (ms: number) => void;
	disableStops(): void;
	stop(): void;
}

export abstract class SolverMachine<F extends StateFun, I extends StateInput>
	implements SolverStateInterface<F, I>
{
	protected stateMachine!: StateMachine<F, I>;
	private runningOnAuto: boolean = $state(false);
	private forcedStop: boolean = $state(false);
	private solverId: KnownSolver = $state('bkt');
	private stopTimeoutMS: number = 0;

	constructor(stateMachine: StateMachine<F, I>, solverId: KnownSolver, stopTimeoutMS: number = 0) {
		this.stateMachine = stateMachine;
		this.runningOnAuto = false;
		this.forcedStop = false;
		this.solverId = solverId;
		this.stopTimeoutMS = stopTimeoutMS;
	}

	updateStopTimeout(ms: number): void {
		this.stopTimeoutMS = Math.max(0, ms);
	}

	disableStops(): void {
		this.updateStopTimeout(0);
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

	async transitionByEvent(input: StateMachineEvent): Promise<void> {
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
			await this.solveToNextDecisionStepByStep();
		} else {
			logFatal('Transition By Event Error', `Unknown event ${input} for solver machine`);
		}
	}

	protected abstract step(): void;

	private _step(): void {
		stateMachineLifeCycleEventBus.emit('begin-step');
		this.step();
		stateMachineLifeCycleEventBus.emit('finish-step');
	}

	protected async automaticStepByStep(continueCond: () => boolean): Promise<void> {
		if (this.runningOnAutomatic()) {
			console.warn('Solver is already running in automatic mode.');
			return;
		}
		this._preStepByStep();
		const times: number[] = [];
		while (!this.forcedStop && !this.onFinalState() && continueCond()) {
			this._step();
			if (this.stopTimeoutMS > 0) {
				await tick();
				await new Promise((r) => times.push(setTimeout(r, this.stopTimeoutMS)));
			}
		}
		times.forEach(clearTimeout);
		this._postStepByStep();
	}

	private _preStepByStep(): void {
		this.setFlagsPreAuto();
		this.notifyRunningOnAuto();
		stateMachineLifeCycleEventBus.emit('begin-step-by-step');
	}

	private _postStepByStep(): void {
		this.setFlagsPostAuto();
		this.notifyFinishRunningOnAuto();
		stateMachineLifeCycleEventBus.emit('finish-step-by-step');
	}

	private notifyRunningOnAuto(): void {
		solverStartedAutoMode.emit();
	}

	private notifyFinishRunningOnAuto(): void {
		solverFinishedAutoMode.emit();
	}

	protected async solveUntilDecision(): Promise<void> {
		this.automaticStepByStep(() => !this.onDecisionState() && !this.onFinalState());
	}

	protected async solveAllStepByStep(): Promise<void> {
		this.automaticStepByStep(() => !this.onFinalState());
	}

	protected async solveTrailStepByStep(): Promise<void> {
		this.automaticStepByStep(() => !this.onConflictState() && !this.onFinalState());
	}

	protected abstract solveToNextVariableStepByStep(): Promise<void>;

	protected abstract solveCDStepByStep(): Promise<void>;

	// Method for running the solver until the next decision is required
	protected async solveToNextDecisionStepByStep(): Promise<void> {
		this.automaticStepByStep(() => !this.onDecisionState() && !this.onFinalState());
	}

	private setFlagsPreAuto(): void {
		this.forcedStop = false;
		this.runningOnAuto = true;
	}

	private setFlagsPostAuto(): void {
		this.runningOnAuto = false;
	}
}
