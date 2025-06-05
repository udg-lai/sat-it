import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine, type PendingItem } from '../SolverMachine.svelte.ts';
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
	pending: PendingItem = $state({clauseSet:new SvelteSet<number>(), variable: -1});

	constructor() {
		super(makeBKTMachine());
		this.pending = {clauseSet:new SvelteSet<number>(), variable: -1};
	}

	// ** functions related to pending **
	isEmpty(): boolean {
		return this.pending.clauseSet.size === 0;
	}

	enqueue(item: PendingItem): void {
		this.clear();
		for (const clause of item.clauseSet) {
			this.pending.clauseSet.add(clause);
		}
		this.pending.variable = item.variable;
	}

	remove(clauseId: number): void {
		if (!this.pending.clauseSet.has(clauseId)) {
			logFatal('Clause not found', 'Error at removing a clause from the BKT Solver Machine');
		} else {
			this.pending.clauseSet.delete(clauseId);
		}
	}

	clear(): void {
		this.pending = {clauseSet:new SvelteSet<number>(), variable: -1};
	}

	consultPending(): PendingItem {
		if (this.pending.clauseSet.size === 0) {
			logError('Can not consult an empty set');
		}
		return this.pending;
	}

	getPending(): PendingItem {
		const clausesSnapshot: SvelteSet<number> = new SvelteSet<number>();
		for (const clause of this.pending.clauseSet) {
			clausesSnapshot.add(clause);
		}
		const pendingSnapshot: PendingItem = {clauseSet: clausesSnapshot,  variable: this.pending.variable}
		return pendingSnapshot;
	}

	getRecord(): Record<string, unknown> {
		return {
			pending: this.getPending()
		};
	}

	// ** abstract functions **
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.pending = {clauseSet:new SvelteSet<number>(), variable: -1};
			updateClausesToCheck(this.pending.clauseSet, this.pending.variable);
			return;
		}
		const pendingRecord: PendingItem = record['pending'] as PendingItem;
		this.pending.clauseSet.clear();
		this.enqueue(pendingRecord);
		if (!this.isEmpty()) updateClausesToCheck(this.pending.clauseSet, this.pending.variable);
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
		while (this.pending.clauseSet.size !== 0 && !this.forcedStop) {
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
