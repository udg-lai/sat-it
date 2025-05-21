import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.ts';
import { makeBKTMachine } from './bkt-state-machine.ts';
import type { StateMachineEvent } from '$lib/transversal/events.ts';
import { logFatal } from '$lib/transversal/logging.ts';
import { bkt_stateName2StateId, initial } from './bkt-states.ts';
import { updateClausesToCheck } from '$lib/store/clausesToCheck.svelte.ts';
import { initialTransition } from './bkt-solver-transitions.ts';

export const makeDPLLSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine();
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	pending: SvelteSet<number>;

	constructor() {
		super();
		this.stateMachine = makeBKTMachine();
		this.pending = new SvelteSet<number>();
	}

	transition(input: StateMachineEvent): void {
		if (input === 'step') {
			this.logicStep();
		} else if (input === 'followingVariable' || input === 'finishUP') {
			while (!this.isEmpty()) {
				this.logicStep();
			}
		} else if (input === 'solve_trail') {
			while (!this.onBacktrackingState() && !this.onFinalState()) {
				this.logicStep();
			}
		} else if (input === 'solve_all') {
			while (!this.onFinalState()) {
				this.logicStep();
			}
		} else {
			logFatal('Non expected input for Bkt Solver Machine');
		}
	}

	private logicStep(): void {
		const activeId: number = this.stateMachine.getActiveId();
		//The initial state
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		}
		//Waiting to analyze the next clause of the clauses to revise
		else if (activeId === bkt_stateName2StateId.next_clause_state) {
			console.log('TODO');
			//analyzeClause(this);
		}
		//Waiting to decide a variables
		else if (activeId === bkt_stateName2StateId.decide_state) {
			console.log('TODO');
			//decide(this);
		}
		//Waiting to backtrack an assignment
		else if (activeId === bkt_stateName2StateId.bkt_state) {
			console.log('TODO');
			//backtracking(this);
		}
	}

	private onFinalState(): boolean {
		const activeId: number = this.stateMachine.getActiveId();
		return (
			activeId === bkt_stateName2StateId.sat_state || activeId === bkt_stateName2StateId.unsat_state
		);
	}

	private onBacktrackingState(): boolean {
		const activeId: number = this.stateMachine.getActiveId();
		return activeId === bkt_stateName2StateId.bkt_state;
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

	getFirstStateId(): number {
		return initial;
	}

	getBacktrackingStateId(): number {
		return bkt_stateName2StateId['bkt_state'];
	}

	// ** functions related to pending **
	isEmpty(): boolean {
		return this.pending.size === 0;
	}

	enqueue(clauses: SvelteSet<number>): void {
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
}
