import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
import type { ClauseTag, Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import ClausePool from './ClausePool.svelte.ts';
import type Literal from './Literal.svelte.ts';
import OccurrenceTable from './OccurrenceTable.svete.ts';
import type { Trail } from './Trail.svelte.ts';
import type Variable from './Variable.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';


export interface Watch {
	clauseTag: ClauseTag;
	literalPos: number;
}
export type WatchTable = Map<Lit, Watch[]>;

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new OccurrenceTable());
	private watchTable: WatchTable = $state(new Map<Lit, Watch[]>());

	constructor(instance: DimacsInstance | undefined = undefined) {
		if (instance !== undefined) this.syncWithDimacsInstance(instance);
	}

	getClausePool(): ClausePool {
		return this.clauses;
	}

	getOccurrencesTableMapping(): Map<Lit, Set<ClauseTag>> {
		return this.occurrencesTable.getTable();
	}

	getVariablePool(): VariablePool {
		return this.variables;
	}

	syncWithDimacsInstance({ summary }: DimacsInstance): void {
		const { varCount, claims } = summary;
		this.variables = new VariablePool(varCount);
		this.clauses = ClausePool.buildFrom(claims, this.variables);
		this.occurrencesTable = new OccurrenceTable(this.clauses.getClauses());
		this.watchTable = this.makeWatchTable();
	}

	syncWithTrail(trail: Trail) {
		// The assignment is the empty set at first
		this.variables.wipe();

		// Then, we assign the variables as in the trail
		// this is possible because the assignments in the trail are a copy of the variables in the pool
		for (const assignment of trail)
		{
			const variable: Variable = assignment.getVariable();
			this.variables.assign(variable.toInt(), variable.getAssignment());
		}
	}

	forgetLearnedClauses() {
		const removedClauses: Clause[] = this.clauses.pruneLearnedClauses();
		this.occurrencesTable.multipleRemoveOccurrences(removedClauses);
	}

	learnClauses(clauses: Clause[]) {
		for (const clause of clauses) {
			if (!clause.hasBeenLearned())
				logError('Learning clause', 'Clause to be learned was not marked as learned');
			this.clauses.addClause(clause);
			this.occurrencesTable.addOccurrences(clause);
		}
	}

	addClause(clause: Clause) {
		this.clauses.addClause(clause);
		this.occurrencesTable.addOccurrences(clause);
	}

	private makeWatchTable(): WatchTable {
		// The clause allocator (i.e., ClausePool) must have already assigned tags to all clauses
		const watchTable: WatchTable = new Map();

		for (const clause of this.clauses.getClauses()) {

			// If the clause is unit, skip it
			if (clause.isUnit()) continue;

			// Otherwise, get the first two literals to watch
			const literals: Literal[] = clause.getLiterals().slice(0, 2);

			const clauseTag = clause.getTag();
			if (clauseTag === undefined)
				logFatal('Making watch table', 'Clause without tag found when making watch table');

			// Watch the first two literals in the clause
			for (let i = 0; i < literals.length; i++) {
				const literalId: number = literals[i].toInt();
				const watch: Watch = {
					clauseTag: clauseTag,
					literalPos: i
				};
				if (watchTable.has(literalId)) {
					const watches = watchTable.get(literalId);
					watches?.push(watch);
				} else {
					const watches: Watch[] = [watch];
					watchTable.set(literalId, watches);
				}
			}
		}
		return watchTable;
	}

	private updateWatchTable(): void {
		// This function should be called when the current assignment is modified
		// or the clause pool is modified because some learned clauses are removed.
	}
}
