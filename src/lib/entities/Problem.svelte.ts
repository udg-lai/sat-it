import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import type { CRef, Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import ClausePool from './ClausePool.svelte.ts';
import OccurrenceTable from './OccurrenceTable.svelte.ts';
import type { Trail } from './Trail.svelte.ts';
import type Variable from './Variable.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';
import WatchTable from './WatchTable.svelte.ts';

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new OccurrenceTable());
	private watchTable: WatchTable = $state(new WatchTable());

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

	syncWithDimacsInstance({ summary }: DimacsInstance): void {
		const { varCount, claims } = summary;
		this.variables = new VariablePool(varCount);
		this.clauses = ClausePool.buildFrom(claims, this.variables);
		this.occurrencesTable = new OccurrenceTable(this.clauses.getClauses());
		this.watchTable = new WatchTable(this.clauses.getClauses());
	}

	syncWithTrail(trail: Trail) {
		// The assignment is the empty set at first
		this.variables.wipe();

		// Then, we assign the variables as in the trail
		// this is possible because the assignments in the trail are a copy of the variables in the pool
		for (const assignment of trail) {
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
}
