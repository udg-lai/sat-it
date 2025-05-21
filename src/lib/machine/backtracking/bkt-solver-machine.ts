import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.ts';
import { makeBKTMachine } from './bkt-state-machine.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';

export const makeDPLLSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine();
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	transition(input: StateMachineEvent): void {
		throw new Error('Method not implemented.');
	}
	getRecord(): Record<string, unknown> {
		throw new Error('Method not implemented.');
	}
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		throw new Error('Method not implemented.');
	}
	getFirstStateId(): number {
		throw new Error('Method not implemented.');
	}
	getBacktrackingStateId(): number {
		throw new Error('Method not implemented.');
	}

	enqueue(clauses: SvelteSet<number>): void {
		for (const clause of clauses) {
			this.pending.add(clause);
		}
	}

	clear(): void {
		this.pending = new SvelteSet<number>();
	}

	pending: SvelteSet<number>;

	constructor() {
		super();
		this.stateMachine = makeBKTMachine();
		this.pending = new SvelteSet<number>();
	}
}
