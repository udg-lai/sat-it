import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { tick } from 'svelte';
import type { StateFun, StateInput, StateMachine } from './StateMachine.svelte.ts';
import { logWarning } from '$lib/store/toasts.ts';
import { getStepDelay } from '$lib/store/delay-ms.svelte.ts';

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
	detectingConflict: () => boolean;
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

	abstract transition(input: StateMachineEvent): Promise<void>;

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

	onFinalState(): boolean {
		return this.stateMachine.onFinalState();
	}

	onInitialState(): boolean {
		return this.stateMachine.onInitialState();
	}

	detectingConflict(): boolean {
		return false;
	}

	stopAutoMode(): void {
		console.debug('SolverMachine', 'forcing stop');
		this.forcedStop = true;
	}

	protected abstract step(): void;

	protected async solveAllStepByStep(): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		while (!this.completed() && !this.forcedStop) {
			this.step();
			console.log('forcedStop', this.forcedStop);
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	protected async solveTrailStepByStep(): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		while (!this.completed() && !this.onConflictState() && !this.forcedStop) {
			this.step();
			console.log('forcedStop', this.forcedStop);
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	protected setFlagsPreAuto(): void {
		this.forcedStop = false;
		this.runningOnAuto = true;
	}

	protected setFlagsPostAuto(): void {
		this.runningOnAuto = false;
	}

	protected assertPreAuto(): boolean {
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
