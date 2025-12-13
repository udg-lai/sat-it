import { logError } from '$lib/states/toasts.svelte.ts';
import type { Lit } from '$lib/types/types.ts';
import Clause from './Clause.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { isPropagationReason, type Propagation, type Reason } from './VariableAssignment.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import Literal from './Literal.svelte.ts';
import { makeLeft, makeRight, type Either } from '$lib/types/either.ts';

export interface Resolution {
	conflictClause: Clause;
	reason: Clause;
	resolvent: {
		clause: Clause;
		asserting: boolean
	}
}

export type VirtualResolution = Either<Clause, Resolution>;

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
		return this.pointer < 0 || this.hasAssertiveClause();
	}

	hasAssertiveClause(): boolean {
		return this._resolventIsAssertive(this.clause);
	}

	private _resolventIsAssertive(resolvent: Clause): boolean {
		const literals: Lit[] = this.ldlPropagations.map((lit: VariableAssignment) => lit.toLit());
		literals.push(this.decision.toLit());
		return resolvent.isAssertive(literals);
	}

	getClause(): Clause {
		return this.clause;
	}

	currentImplication(): VariableAssignment {
		if (this.pointer < 0) {
			logError(
				'Conflict Analysis Error',
				'No more implications left to consider in conflict analysis'
			);
		}
		return this.ldlPropagations[this.pointer];
	}

	virtualResolution(): VirtualResolution {
		// If the complementary literal of the current assignment appears in `this.clause`, we perform a resolution step
		// otherwise, the resulting clause is the same as `this.clause`
		if (this.finished()) {
			logError(
				'Conflict Analysis Error',
				'Conflict analysis is already finished, no more resolution steps can be performed'
			);
		}

		const propagation: VariableAssignment = this.currentImplication();
		const complementary: Lit = Literal.complementary(propagation.toLit());

		// Next literal to consider in the conflict analysis
		this.pointer -= 1;

		// Checks if the complementary of the propagated literal is in the clause being analyzed
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
			this.updateConflictiveClause(resolvent);

			return makeRight({
				conflictClause: this.clause.copy(),
				reason: reason,
				resolvent: {
					clause: resolvent,
					asserting: this._resolventIsAssertive(resolvent)
				}
			});
		} else {
			// No resolution is performed, the clause remains the same
			return makeLeft(this.clause.copy());
		}
	}

	private updateConflictiveClause(resolvent: Clause): void {
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
