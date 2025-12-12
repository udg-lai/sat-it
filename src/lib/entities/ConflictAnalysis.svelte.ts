import { logError } from '$lib/states/toasts.svelte.ts';
import type { Lit } from '$lib/types/types.ts';
import type Clause from './Clause.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { isPropagationReason, type Propagation, type Reason } from './VariableAssignment.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import Literal from './Literal.svelte.ts';

export class ConflictAnalysis {
	clause: Clause;
	decision: VariableAssignment;
	ldlPropagations: VariableAssignment[];
	pointer: number;

	constructor(
		conflictClause: Clause,
		decision: VariableAssignment,
		ldlPropagations: VariableAssignment[]
	) {
		if (!conflictClause.falsified()) {
			logError(
				'Conflict Analysis Error',
				'The conflict clause must be falsified to start conflict analysis'
			);
		}
		if (ldlPropagations.length === 0) {
			logError(
				'Conflict Analysis Error',
				'There must be at least one literal from the last decision level in the propagations'
			);
		}
		if (!decision.isD()) {
			logError('Conflict Analysis Error', 'The provided decision assignment is not a decision');
		}
		for (const lit of ldlPropagations) {
			if (!lit.wasPropagated()) {
				logError(
					'Conflict Analysis Error',
					'All literals in the last decision level propagations must be propagated literals'
				);
			}
		}
		this.clause = conflictClause;
		this.decision = decision;
		this.ldlPropagations = ldlPropagations;
		this.pointer = ldlPropagations.length - 1;
	}

	// Conflict analysis finished when the clause has only one literal from the current decision level

	finished(): boolean {
		const literals: Lit[] = this.ldlPropagations.map((lit: VariableAssignment) => lit.toLit());
		literals.push(this.decision.toLit());
		return this.pointer < 0 || this.clause.isAssertive(literals);
	}

	getClause(): Clause {
		return this.clause;
	}

	virtualResolution(): Clause {
		// If the complementary literal of the current assignment appears in `this.clause`, we perform a resolution step
		// otherwise, the resulting clause is the same as `this.clause`
		if (this.finished()) {
			logError(
				'Conflict Analysis Error',
				'Conflict analysis is already finished, no more resolution steps can be performed'
			);
		}

		const propagation: VariableAssignment = this.ldlPropagations[this.pointer];
		const complementary: Lit = Literal.complementary(propagation.toLit());

		if (this.clause.contains(complementary)) {
			const r: Reason = propagation.getReason();
			if (!isPropagationReason(r)) {
				logError(
					'Conflict Analysis Error',
					'The reason must be a propagation reason to continue conflict analysis'
				);
			}
			const reason: Clause = getClausePool().at((r as Propagation).cRef);
			const resolvent: Clause = this.clause.resolution(reason);
			this.update(resolvent);
			this.pointer -= 1;
			return this.clause.copy();
		} else {
			return this.clause.copy();
		}
	}

	private update(resolvent: Clause): void {
		if (!resolvent.falsified()) {
			logError(
				'Conflict Analysis Error',
				'The resolvent clause must be falsified to continue conflict analysis'
			);
		}
		// Updates the clause being analyzed
		this.clause = resolvent;
	}
}
