import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
import { logFatal, logWarning } from '$lib/states/toasts.svelte.ts';
import {
	solverFinishedAutoMode,
	solverStartedAutoMode,
	stateMachineLifeCycleEventBus,
	updateTrailsEventBus,
	type StateMachineEvent
} from '$lib/events/events.ts';
import { tick } from 'svelte';
import type { StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';

export type KnownSolver = 'bkt' | 'dpll' | 'cdcl';

export interface SolverStateInterface<F extends StateFun, I extends StateInput> {
	transition: (input: StateMachineEvent) => Promise<void>;
	getActiveStateId: () => number;
	updateActiveStateId: (id: number) => void;
	updateFromRecord: (record: Record<string, unknown>) => void;
	isInAutoMode: () => boolean;
	stopAutoMode: () => void;
	completed: () => boolean;
	onPreConflictState: () => boolean;
	onConflictState: () => boolean;
	onInitialState: () => boolean;
	onFinalState: () => boolean;
	onConflictDetection: () => boolean;
	identify: () => KnownSolver;
	getStateMachine: () => StateMachine<F, I>;
}

export abstract class SolverMachine<F extends StateFun, I extends StateInput>
	implements SolverStateInterface<F, I>
{
	protected stateMachine!: StateMachine<F, I>;
	private runningOnAuto: boolean = $state(false);
	private forcedStop: boolean = $state(false);
	private solverId: KnownSolver = $state('bkt');
	private stops: boolean = $state(false);

	constructor(stateMachine: StateMachine<F, I>, solverId: KnownSolver) {
		this.stateMachine = stateMachine;
		this.runningOnAuto = false;
		this.forcedStop = false;
		this.solverId = solverId;
	}

	abstract getRecord(): Record<string, unknown>;

	abstract updateFromRecord(record: Record<string, unknown> | undefined): void;

	isInAutoMode(): boolean {
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

	completed(): boolean {
		return this.stateMachine.onFinalState();
	}

	onPreConflictState(): boolean {
		return this.stateMachine.onPreConflictState();
	}

	onConflictState(): boolean {
		return this.stateMachine.onConflictState();
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

	abstract onConflictDetection(): boolean;

	stopAutoMode(): void {
		this.forcedStop = true;
	}

	identify(): KnownSolver {
		return this.solverId;
	}

	enableStops(): void {
		this.stops = true;
	}

	disableStops(): void {
		this.stops = false;
	}

	async transition(input: StateMachineEvent): Promise<void> {
		if (input === 'step') {
			stateMachineLifeCycleEventBus.emit('begin-step');
			this.step();
			stateMachineLifeCycleEventBus.emit('finish-step');
		} else if (input === 'nextVariable') {
			await this.solveToNextVariableStepByStep();
		} else if (input === 'finishCD') {
			await this.solveCDStepByStep();
		} else if (input === 'solve_trail') {
			await this.solveTrailStepByStep();
		} else if (input === 'solve_all') {
			await this.solveAllStepByStep();
		} else {
			logFatal('Non expected input in Solver State Machine');
		}
	}

	protected abstract step(): void;

	protected async stepByStep(continueCond: () => boolean): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this._preStepByStep();
		const times: number[] = [];
		while (continueCond() && !this.forcedStop) {
			this.step();
			if( this.stops) {
				await tick();
				updateTrailsEventBus.emit();
				await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
			}
		}
		if(!this.stops) {
			updateTrailsEventBus.emit();
			await tick()
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

	protected async solveAllStepByStep(): Promise<void> {
		this.stepByStep(() => !this.completed());
	}

	protected async solveTrailStepByStep(): Promise<void> {
		this.stepByStep(() => !this.onConflictState() && !this.completed());
	}

	protected abstract solveToNextVariableStepByStep(): Promise<void>;

	protected abstract solveCDStepByStep(): Promise<void>;

	private setFlagsPreAuto(): void {
		this.forcedStop = false;
		this.runningOnAuto = true;
	}

	private setFlagsPostAuto(): void {
		this.runningOnAuto = false;
	}

	private assertPreAuto(): boolean {
		let assert = true;
		if (this.isInAutoMode()) {
			logWarning('Solver machine', 'Solver is already running on auto');
			assert = false;
		}
		if (this.stateMachine.onFinalState()) {
			this.runningOnAuto = false;
			logWarning('Solver machine', 'Solver is already completed');
			assert = false;
		}
		return assert;
	}
}
