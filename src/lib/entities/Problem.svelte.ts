import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { focusOnAssignment, wipeFocusAssignment } from '$lib/states/focused-assignment.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import { fromJust, isJust, type Maybe } from '$lib/types/maybe.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import ClausePool from './ClausePool.svelte.ts';
import OccurrenceList from './OccurrenceList.svelte.ts';
import OccurrenceTable from './OccurrenceTable.svelte.ts';
import { Queue } from './Queue.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';
import WatchTable from './WatchTable.svelte.ts';

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new OccurrenceTable());
	private watchTable: WatchTable = $state(new WatchTable());

	private currentOccurrences: OccurrenceList = $state(new OccurrenceList());
	private occurrenceQueue: Queue<OccurrenceList> = $state(new Queue<OccurrenceList>());

	constructor(instance: DimacsInstance | undefined = undefined) {
		if (instance !== undefined) this.syncWithDimacsInstance(instance);
	}

	getClausePool(): ClausePool {
		return this.clauses;
	}

	getOccurrencesTableMapping(): Map<Lit, Set<CRef>> {
		return this.occurrencesTable.getTable();
	}

	getVariablePool(): VariablePool {
		return this.variables;
	}

	getCurrentOccurrences(): OccurrenceList {
		return this.currentOccurrences;
	}

	getOccurrenceListQueue(): Queue<OccurrenceList> {
		return this.occurrenceQueue;
	}

	syncWithDimacsInstance({ summary }: DimacsInstance): void {
		const { varCount, claims } = summary;
		this.variables = new VariablePool(varCount);
		this.clauses = ClausePool.buildFrom(claims, this.variables);
		this.occurrencesTable = new OccurrenceTable(this.clauses.getClauses());
		this.watchTable = new WatchTable(this.clauses.getClauses());
		this.wipeOccurrences();
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

	updateCurrentOccurrences(newOL: OccurrenceList): void {
		this.currentOccurrences = newOL;
		const literal: Maybe<Lit> = this.currentOccurrences.getLiteral();
		//The value is * -1 as the trail contains the complementary of the literal whose clauses are being checked
		if (isJust(literal)) focusOnAssignment(fromJust(literal) * -1);
		else wipeFocusAssignment();
	}

	wipeOccurrences(): void {
		this.currentOccurrences = new OccurrenceList();
		this.occurrenceQueue = new Queue<OccurrenceList>();
	}
}
