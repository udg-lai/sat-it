import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { getConflictAnalysis } from '$lib/states/conflict-anlysis.svelte.ts';
import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import { fromJust, makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import ClausePool from './ClausePool.svelte.ts';
import Literal from './Literal.svelte.ts';
import OccurrenceList from './OccurrenceList.svelte.ts';
import OccurrenceTable from './OccurrenceTable.svelte.ts';
import { Queue } from './Queue.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';
import WatchTable, { type Watch } from './WatchTable.svelte.ts';

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new OccurrenceTable());
	private watchTable: WatchTable = $state(new WatchTable());

	private occurrenceQueue: Queue<OccurrenceList<CRef>> = $state(new Queue<OccurrenceList<CRef>>());
	private currentOccurrences: OccurrenceList<CRef> = $derived(this.currentOccurrenceList());
	private focusedAssignment: Maybe<Lit> = $derived(this.currentFocusedAssignment());

	private watchesQueue: Queue<OccurrenceList<Watch>> = $state(new Queue<OccurrenceList<Watch>>());
	private currentWatch: OccurrenceList<Watch> = $derived(this.currentWatchList());

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

	getCurrentOccurrences(): OccurrenceList<CRef> {
		return this.currentOccurrences;
	}

	getOccurrenceListQueue(): Queue<OccurrenceList<CRef>> {
		return this.occurrenceQueue;
	}

	getCurrentWatch(): OccurrenceList<Watch> {
		return this.currentWatch;
	}

	getWatchesQueue(): Queue<OccurrenceList<Watch>> {
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
		const removedClauses: Clause[] = this.clauses.pruneLearnedClauses();
		this.occurrencesTable.multipleRemoveOccurrences(removedClauses);
	}

	learnClauses(clauses: Clause[]) {
		for (const clause of clauses) {
			if (!clause.isLemma())
				logError('Learning clause', 'Clause to be learned was not marked as learned');
			this.clauses.addClause(clause);
			this.occurrencesTable.addOccurrences(clause);
		}
	}

	addClause(clause: Clause): CRef {
		const cRef: CRef = this.clauses.addClause(clause);
		this.occurrencesTable.addOccurrences(clause);
		return cRef;
	}

	dropOccurrences(): void {
		this.occurrenceQueue = new Queue<OccurrenceList<CRef>>();
		this.watchesQueue = new Queue<OccurrenceList<Watch>>();
	}

	private currentOccurrenceList(): OccurrenceList<CRef> {
		if (this.occurrenceQueue.isEmpty()) {
			return new OccurrenceList();
		} else {
			return this.occurrenceQueue.element();
		}
	}

	private currentWatchList(): OccurrenceList<Watch> {
		if (this.watchesQueue.isEmpty()) {
			return new OccurrenceList<Watch>();
		} else {
			return this.watchesQueue.element();
		}
	}

	// When in conflict analysis in CDCL, the focused assignment should be the one that is taking place in the current resolution.
	private currentFocusedAssignment(): Maybe<Lit> {
		if (!this.currentOccurrences.isEmpty()) {
			const trailAssignment: Lit = Literal.complementary(
				fromJust(this.currentOccurrences.getLiteral())
			);
			return makeJust(trailAssignment);
		} else if (getSolverMachine().onConflictState() && getSolverMachine().identify() === 'cdcl') {
			const currentImplication: Lit = getConflictAnalysis().currentImplication().toLit();
			return makeJust(currentImplication);
		} else {
			return makeNothing();
		}
	}
}
