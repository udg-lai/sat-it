import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { tick } from 'svelte';
import type { StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';
import { logFatal, logWarning } from '$lib/store/toasts.ts';
import { getStepDelay } from '$lib/store/delay-ms.svelte.ts';

export type ConflictAnalysis = {
	clauses: Set<number>;
	variableReasonId: number;
};

export interface SolverStateInterface<F extends StateFun, I extends StateInput> {
	stateMachine: StateMachine<F, I>;
	runningOnAuto: boolean;
	transition: (input: StateMachineEvent) => Promise<void>;
	getActiveStateId: () => number;
	updateActiveStateId: (id: number) => void;
	updateFromRecord: (record: Record<string, unknown>) => void;
	isInAutoMode: () => boolean;
	stopAutoMode: () => void;
	completed: () => boolean;
	onConflictState: () => boolean;
	onInitialState: () => boolean;
	onFinalState: () => boolean;
	onConflictDetection: () => boolean;
}

export abstract class SolverMachine<F extends StateFun, I extends StateInput>
	implements SolverStateInterface<F, I>
{
	//With the exclamation mark, we assure that the stateMachine attribute will be assigned before its use
	stateMachine!: StateMachine<F, I>;
	runningOnAuto: boolean = $state(false);
	forcedStop: boolean = $state(false);

	constructor(stateMachine: StateMachine<F, I>) {
		this.stateMachine = stateMachine;
		this.runningOnAuto = false;
		this.forcedStop = false;
	}

	abstract getRecord(): Record<string, unknown>;

	abstract updateFromRecord(record: Record<string, unknown> | undefined): void;

	isInAutoMode(): boolean {
		return this.runningOnAuto;
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

	onConflictState(): boolean {
		return this.stateMachine.onConflictState();
	}

	onUnsatState(): boolean {
		return this.stateMachine.onUnsatState();
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

	async transition(input: StateMachineEvent): Promise<void> {
		//If receive a step, the state machine can be waiting in 4 possible states
		if (input === 'step') {
			this.step();
		} else if (input === 'nextVariable') {
			await this.solveToNextVariableStepByStep();
		} else if (input === 'finishUP') {
			await this.solveUPStepByStep();
		} else if (input === 'solve_trail') {
			await this.solveTrailStepByStep();
		} else if (input === 'solve_all') {
			await this.solveAllStepByStep();
		} else {
			logFatal('Non expected input Solver State Machine');
		}
	}

	protected abstract step(): void;

	protected async stepByStep(continueCond: () => boolean): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		while (continueCond() && !this.forcedStop) {
			this.step();
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	protected async solveAllStepByStep(): Promise<void> {
		this.stepByStep(() => !this.completed());
	}

	protected async solveTrailStepByStep(): Promise<void> {
		this.stepByStep(() => !this.onConflictState() && !this.completed());
	}

	protected abstract solveToNextVariableStepByStep(): Promise<void>;

	protected abstract solveUPStepByStep(): Promise<void>;

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
