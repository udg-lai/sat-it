import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import type { Either } from '$lib/types/either.ts';
import { fromJust, isNothing, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import ClausePool from './ClausePool.svelte.ts';
import Literal from './Literal.svelte.ts';
import ClauseList from './OccurrenceList.svelte.ts';
import OccurrenceTable from './OccurrenceTable.svelte.ts';
import { Queue } from './Queue.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';
import WatchTable, { type Watch } from './WatchTable.svelte.ts';

export type EWC = Either<Watch, CRef>;

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new OccurrenceTable());
	private watchTable: WatchTable = $state(new WatchTable());

	private occurrenceQueue: Queue<ClauseList<CRef>> = $state(new Queue<ClauseList<CRef>>());
	private currentOccurrences: ClauseList<CRef> = $derived(this.currentOccurrenceList());
	private focusedAssignment: Maybe<Lit> = $derived(this.currentFocusedAssignment());

	// The CRef is necessary at the inprocess step because unary and empty clauses do not have watches. :)
	private watchesQueue: Queue<ClauseList<EWC>> = $state(new Queue<ClauseList<EWC>>());
	private currentWatch: ClauseList<EWC> = $derived(this.currentWatchList());

	constructor(instance: DimacsInstance | undefined = undefined) {
		if (instance !== undefined) this.syncWithDimacsInstance(instance);
	}

	getClausePool(): ClausePool {
		return this.clauses;
	}

	getOccurrencesTableMapping(): Map<Lit, Set<CRef>> {
		return this.occurrencesTable.getTable();
	}

	getWatchTableMapping(): WatchTable {
		return this.watchTable;
	}

	getVariablePool(): VariablePool {
		return this.variables;
	}

	getFocusedAssignment(): Maybe<Lit> {
		return this.focusedAssignment;
	}

	getCurrentOccurrences(): ClauseList<CRef> {
		return this.currentOccurrences;
	}

	getOccurrenceListQueue(): Queue<ClauseList<CRef>> {
		return this.occurrenceQueue;
	}

	getCurrentWatch(): ClauseList<EWC> {
		return this.currentWatch;
	}

	getWatchesQueue(): Queue<ClauseList<EWC>> {
		return this.watchesQueue;
	}

	syncWithDimacsInstance({ summary }: DimacsInstance): void {
		const { varCount, claims } = summary;
		this.variables = new VariablePool(varCount);
		this.clauses = ClausePool.buildFrom(claims, this.variables);
		this.occurrencesTable = new OccurrenceTable(this.clauses.getClauses());
		this.watchTable = new WatchTable(this.clauses.getClauses());
		this.dropOccurrences();
	}

	forgetLearnedClauses() {
		// This is for a future functionality about forget learned clauses
		const learned: Clause[] = this.clauses.getLearnedClauses();
		for (const clause of learned) {
			if (!clause.isLemma())
				logError('Forgetting learned clause', 'Clause to be forgotten was not marked as learned');
			this.occurrencesTable.removeOccurrences(clause);
			this.watchTable.deleteWatches(clause);
		}
		this.clauses.wipeLearnedClauses();
	}

	learnClauses(clauses: Clause[]) {
		for (const clause of clauses) {
			this.learnClause(clause);
		}
	}

	learnClause(clause: Clause): CRef {
		if (!clause.isLemma())
			logError('Learning clause', 'Clause to be learned was not marked as learned');
		const cRef: CRef = this.clauses.addClause(clause);
		this.occurrencesTable.addOccurrences(clause);
		this.watchTable.addWatches(clause);
		return cRef;
	}

	dropOccurrences(): void {
		this.occurrenceQueue = new Queue<ClauseList<CRef>>();
		this.watchesQueue = new Queue<ClauseList<EWC>>();
	}

	private currentOccurrenceList(): ClauseList<CRef> {
		if (this.occurrenceQueue.isEmpty()) {
			return new ClauseList();
		} else {
			return this.occurrenceQueue.element();
		}
	}

	private currentWatchList(): ClauseList<EWC> {
		if (this.watchesQueue.isEmpty()) {
			return new ClauseList<EWC>();
		} else {
			return this.watchesQueue.element();
		}
	}

	// When in conflict analysis in CDCL, the focused assignment should be the one that is taking place in the current resolution.
	private currentFocusedAssignment(): Maybe<Lit> {
		if (!this.currentOccurrences.isEmpty()) {
			//Watch out, there is the possibility where the occurrence list has the unitary and empty clauses
			const occurrenceListReason: Maybe<Lit> = this.currentOccurrences.getLiteral();
			if (isNothing(occurrenceListReason)) {
				return makeNothing();
			} else {
				const trailAssignment: Lit = Literal.complementary(
					fromJust(this.currentOccurrences.getLiteral())
				);
				return makeJust(trailAssignment);
			}
		} else if (getSolverMachine().onConflictState() && getSolverMachine().identify() === 'cdcl') {
			const currentImplication: Lit = getConflictAnalysis().currentImplication().toLit();
			return makeJust(currentImplication);
		} else {
			return makeNothing();
		}
	}
}
