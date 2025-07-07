import {
	cleanClausesToCheck,
	updateClausesToCheck
} from '$lib/states/conflict-detection-state.svelte.ts';
import { logFatal } from '$lib/stores/toasts.ts';
import { SvelteSet } from 'svelte/reactivity';
import { SolverMachine } from '../SolverMachine.svelte.ts';
import type { BKT_FUN, BKT_INPUT } from './bkt-domain.svelte.ts';
import {
	analyzeClause,
	backtracking,
	decide,
	initialTransition,
	preConflictDetection
} from './bkt-solver-transitions.svelte.ts';
import { BKT_StateMachine, makeBKTStateMachine } from './bkt-state-machine.svelte.ts';
import { bkt_stateName2StateId } from './bkt-states.svelte.ts';
import type { OccurrenceList } from '../types.ts';

export const makeBKTSolver = (): BKT_SolverMachine => {
	return new BKT_SolverMachine();
};

export class BKT_SolverMachine extends SolverMachine<BKT_FUN, BKT_INPUT> {
	occurrenceList: OccurrenceList | undefined = $state(undefined);

	constructor() {
		const stateMachine: BKT_StateMachine = makeBKTStateMachine();
		super(stateMachine, 'bkt');
		this.occurrenceList = undefined;
	}

	resolveOccurrences(): void {
		this.occurrenceList = undefined;
	}

	setOccurrenceList(conflict: OccurrenceList): void {
		this.occurrenceList = conflict;
	}

	visitClause(clauseId: number): void {
		if (this.occurrenceList === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at visiting a clause in the BKT Solver Machine'
			);
		}

		const { clauses }: OccurrenceList = this.occurrenceList;

		if (!clauses.has(clauseId)) {
			logFatal('Clause not found', 'Error at removing a clause from the BKT Solver Machine');
		} else {
			clauses.delete(clauseId);
		}
	}

	consultOccurrenceList(): OccurrenceList {
		if (this.occurrenceList === undefined) {
			logFatal(
				'Conflict analysis not initialized',
				'Error at consulting a conflict in the BKT Solver Machine'
			);
		}
		return this.occurrenceList;
	}

	getRecord(): Record<string, unknown> {
		return {
			pending: this.makeOccurrenceListCopy()
		};
	}

	private makeOccurrenceListCopy(): OccurrenceList | undefined {
		if (this.occurrenceList !== undefined) {
			const clauses: SvelteSet<number> = new SvelteSet<number>([
				...this.occurrenceList.clauses.values()
			]);
			const literal: number = this.occurrenceList.literal;
			return { clauses, literal };
		}
		return undefined;
	}

	// ** abstract functions **
	updateFromRecord(record: Record<string, unknown> | undefined): void {
		if (record === undefined) {
			this.occurrenceList = undefined;
			cleanClausesToCheck();
			return;
		}
		const occurrenceListRecord: OccurrenceList = record['pending'] as OccurrenceList;
		this.setOccurrenceList(occurrenceListRecord);
		if (this.onConflictDetection()) {
			const { clauses, literal }: OccurrenceList = occurrenceListRecord;
			updateClausesToCheck(clauses, literal);
		} else {
			cleanClausesToCheck();
		}
	}

	step(): void {
		const activeId: number = this.stateMachine.getActiveId();
		if (activeId === bkt_stateName2StateId.empty_clause_state) {
			initialTransition(this);
		} else if (activeId === bkt_stateName2StateId.all_clauses_checked_state) {
			preConflictDetection(this);
		} else if (activeId === bkt_stateName2StateId.delete_clause_state) {
			analyzeClause(this);
		} else if (activeId === bkt_stateName2StateId.decide_state) {
			decide(this);
		} else if (activeId === bkt_stateName2StateId.empty_pending_occurrence_list_state) {
			backtracking(this);
		}
	}

	protected async solveToNextVariableStepByStep(): Promise<void> {
		this.stepByStep(() => this.onConflictDetection());
	}

	protected async solveCDStepByStep(): Promise<void> {
		this.solveToNextVariableStepByStep();
	}

	onConflictDetection(): boolean {
		if (this.occurrenceList === undefined) {
			return false;
		} else {
			const { clauses }: OccurrenceList = this.occurrenceList;
			return clauses.size > 0 && !this.stateMachine.onConflictState();
		}
	}
}
