import { SvelteSet } from 'svelte/reactivity';
import ClausePool from './ClausePool.svelte.ts';
import { VariablePool } from './VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
import type Clause from './Clause.svelte.ts';
import type { Trail } from './Trail.svelte.ts';
import type Variable from './Variable.svelte.ts';
import { getTrails } from '$lib/states/trails.svelte.ts';
import { logFatal } from '$lib/states/toasts.svelte.ts';
import type Literal from './Literal.svelte.ts';

export type OccurrenceList = SvelteSet<number>;
export type OccurrenceTable = Map<number, OccurrenceList>;
export type WatchTable = Map<number, OccurrenceList>;

export default class Problem {
	private variables: VariablePool = $state(new VariablePool(0));
	private clauses: ClausePool = $state(new ClausePool());
	private occurrencesTable: OccurrenceTable = $state(new Map<number, OccurrenceList>());
	private watchTable: OccurrenceTable = $state(new Map<number, OccurrenceList>());

	constructor(instance: DimacsInstance | undefined = undefined) {
		if (instance !== undefined) this.syncWithDimacsInstance(instance);
	}

	getClausePool(): ClausePool {
		return this.clauses;
	}

	getOccurrencesTable(): OccurrenceTable {
		return this.occurrencesTable;
	}

	getVariablePool(): VariablePool {
		return this.variables;
	}

	syncWithDimacsInstance({ summary }: DimacsInstance): void {
		const { varCount, claims } = summary;
		this.variables = new VariablePool(varCount);
		this.clauses = ClausePool.buildFrom(claims, this.variables);
		this.occurrencesTable = this._makeOccurrenceTable();
	}

	reset(): void {
		this.variables.reset();
	}

	syncWithTrail(trail: Trail) {
		//Reset the variables
		this.variables.reset();
		trail.forEach((assignment) => {
			const variable: Variable = assignment.getVariable();
			this.variables.assign(variable.getInt(), variable.getAssignment());
		});

		//Now we need to relearn the clauses
		this.clauses.clearLearnt();

		//The learnt clauses from the trails are added to the clause pool
		getTrails().forEach((trail) => {
			const learntClause = trail.getLearntClause();
			if (learntClause !== undefined) {
				this.clauses.addClause(learntClause);
			}
		});

		//Reset the mapping
		this.occurrencesTable = this._makeOccurrenceTable();
	}

	resetProblem() {
		this.variables.reset();
		this.clauses.clearLearnt();
		this.occurrencesTable = this._makeOccurrenceTable();
	}

	addClauseToClausePool(lemma: Clause) {
		this.clauses.addClause(lemma);

		if (lemma.getTag() === undefined)
			logFatal('Saving lemma', 'Lemma clause was not giving a tag at adding it into the pool');

		this.updateOccurrenceTable(lemma, lemma.getTag() as number, this.occurrencesTable);
	}

	private _makeOccurrenceTable(): OccurrenceTable {
		const occurrenceTable: Map<number, SvelteSet<number>> = new Map();

		this.clauses.getClauses().forEach((clause, clauseTag) => {
			this.updateOccurrenceTable(clause, clauseTag, occurrenceTable);
		});

		return occurrenceTable;
	}

	private updateOccurrenceTable = (
		clause: Clause,
		clauseTag: number,
		occurrenceTable: OccurrenceTable
	) => {
		clause.getLiterals().forEach((literal: Literal) => {
			const literalId: number = literal.toInt();
			if (occurrenceTable.has(literalId)) {
				const s = occurrenceTable.get(literalId);
				s?.add(clauseTag);
			} else {
				const s = new SvelteSet([clauseTag]);
				occurrenceTable.set(literalId, s);
			}
		});
	};
}
