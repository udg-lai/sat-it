import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';
import { makeBKTMachine } from './bkt-state-machine.svelte.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logError, logFatal } from '$lib/store/toasts.ts';
import { bkt_stateName2StateId } from './bkt-states.svelte.ts';
import { updateClausesToCheck } from '$lib/store/conflict-detection-state.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition
} from './bkt-solver-transitions.svelte.ts';
import { tick } from 'svelte';
import { getStepDelay } from '$lib/store/delay-ms.svelte.ts';

export const makeBKTSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine();
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	pending: SvelteSet<number> = $state(new SvelteSet<number>());

	constructor() {
		super(makeBKTMachine());
		this.pending = new SvelteSet<number>();
	}

	// ** functions related to pending **
	isEmpty(): boolean {
		return this.pending.size === 0;
	}

	enqueue(clauses: SvelteSet<number>): void {
		this.clear();
		for (const clause of clauses) {
			this.pending.add(clause);
		}
	}

	remove(clauseId: number): void {
		if (!this.pending.has(clauseId)) {
			logFatal('Clause not found', 'Error at removing a clause from the BKT Solver Machine');
		} else {
			this.pending.delete(clauseId);
		}
	}

	clear(): void {
		this.pending = new SvelteSet<number>();
	}

	consultPending(): SvelteSet<number> {
		if (this.pending.size === 0) {
			logError('Can not consult an empty set');
		}
		return this.pending;
	}

	getPending(): SvelteSet<number> {
		const snapshot: SvelteSet<number> = new SvelteSet<number>();
		for (const clause of this.pending) {
			snapshot.add(clause);
		}
		return snapshot;
	}

	getRecord(): Record<string, unknown> {
		return {
			pending: this.getPending()
		};
	}

	// ** abstract functions **
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pending = new SvelteSet<number>();
			updateClausesToCheck(new SvelteSet<number>());
			return;
		}
		const pendingClauses: SvelteSet<number> = record['pending'] as SvelteSet<number>;
		this.pending.clear();
		this.enqueue(pendingClauses);
		if (!this.isEmpty()) updateClausesToCheck(this.pending);
	}

	async transition(input: StateMachineEvent): Promise<void> {
		if (input === 'step') {
			this.step();
		} else if (input === 'nextVariable' || input === 'finishUP') {
			await this.solveToNextVariableStepByStep();
		} else if (input === 'solve_trail') {
			await this.solveTrailStepByStep();
		} else if (input === 'solve_all') {
			await this.solveAllStepByStep();
		} else {
			logFatal('Non expected input for DPLL Solver State Machine');
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		} else if (activeId === bkt_stateName2StateId.next_clause_state) {
			analyzeClause(this);
		} else if (activeId === bkt_stateName2StateId.decide_state) {
			decide(this);
		} else if (activeId === bkt_stateName2StateId.backtracking_state) {
			backtracking(this);
		}
	}

	private async solveToNextVariableStepByStep(): Promise<void> {
		if (!this.assertPreAuto()) {
			return;
		}
		this.setFlagsPreAuto();
		const times: number[] = [];
		const postponedClauses: Set<number> = this.consultPending();
		while (postponedClauses.size !== 0 && !this.forcedStop) {
			this.step();
			await tick();
			await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
		}
		times.forEach(clearTimeout);
		this.setFlagsPostAuto();
	}

	detectingConflict(): boolean {
		return !this.isEmpty();
	}
}
