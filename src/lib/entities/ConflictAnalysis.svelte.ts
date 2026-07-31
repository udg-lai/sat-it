import { skippedResolutionsEventBus } from '$lib/events/events.ts';
import { getClausePool } from '$lib/states/problem.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import { makeJust, makeNothing, type Maybe } from '$lib/types/maybe.ts';
import type { Lit } from '$lib/types/types.ts';
import Clause from './Clause.svelte.ts';
import Literal from './Literal.svelte.ts';
import type Variable from './Variable.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type Propagation } from './VariableAssignment.ts';

export interface Resolution {
	next: {
		over: Maybe<Variable>;
		nSkip: number;
	};
	over: Variable;
	nth: number;
	conflictClause: Clause;
	reason: Clause;
	resolvent: {
		clause: Clause;
		asserting: boolean;
	};
}

interface PointerUpdate {
	nextPointer: number;
	nSteps: number;
}

export class ConflictAnalysis {
	conflictiveClause: Clause;
	decision: VariableAssignment;
	ldlPropagations: VariableAssignment[];
	pointer: number;
	nth: number;

	constructor(
		conflictClause: Clause,
		decision: VariableAssignment,
		ldlPropagations: VariableAssignment[]
	) {
		if (conflictClause.isEmpty()) {
			logError('Conflict Analysis Error', 'Conflictive clause can not contain the empty clause');
		}
		if (!conflictClause.violated()) {
			logError(
				'Conflict Analysis Error',
				'The conflict clause must be violated to start conflict analysis'
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
			if (!lit.isImplied()) {
				logError(
					'Conflict Analysis Error',
					'All literals in the last decision level propagations must be implied literals'
				);
			}
		}
		this.conflictiveClause = conflictClause;
		this.decision = decision;
		this.ldlPropagations = ldlPropagations;

		// Out of the last propagation
		this.pointer = this.ldlPropagations.length;
		const { nextPointer, nSteps } = this._nextImplicationIndex();
		this.pointer = nextPointer;

		// Inform the number of steps to the application to fill the gaps
		skippedResolutionsEventBus.emit(nSteps);

		// The nth position of the resolution from right-to-left
		this.nth = 0;
	}

	// Conflict analysis finished when the clause has only one literal from the current decision level
	finished(): boolean {
		return this.pointer < 0 || this._clauseContainsAssertiveLiteral(this.conflictiveClause);
	}

	resolventContainsAssertiveLiteral(): boolean {
		return this._clauseContainsAssertiveLiteral(this.conflictiveClause);
	}

	_clauseContainsAssertiveLiteral(clause: Clause): boolean {
		const literals: Lit[] = this.ldlPropagations.map((lit: VariableAssignment) => lit.toLit());
		literals.push(this.decision.toLit());
		return clause.isAssertive(literals);
	}

	getConflictiveClause(): Clause {
		return this.conflictiveClause;
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

	getImplication(pointer: number): VariableAssignment {
		if (pointer < 0 || pointer >= this.ldlPropagations.length) {
			logError(
				'Conflict Analysis Error',
				'No more implications left to consider in conflict analysis'
			);
		}
		return this.ldlPropagations[pointer];
	}

	_nextImplicationIndex(): PointerUpdate {
		if (this.finished()) {
			return { nextPointer: -1, nSteps: 0 };
		} else {
			// Find next reason to apply resolution with the current conflictive clause
			let reasonFound: boolean = false;
			let pointer: number = this.pointer - 1;
			while (!reasonFound && pointer >= 0) {
				const propagation: VariableAssignment = this.getImplication(pointer);
				const complementary: Lit = Literal.complementary(propagation.toLit());

				if (this.conflictiveClause.contains(complementary)) reasonFound = true;
				else pointer -= 1;
			}
			const steps: number = this.pointer - pointer - 1;
			if (!reasonFound || pointer < 0) {
				return { nextPointer: -1, nSteps: steps };
			} else return { nextPointer: pointer, nSteps: steps };
		}
	}

	resolution(): Resolution {
		// It is expected the pointer to be at the implication literal that we use its variable
		// to resolve with the current conflictive clause

		if (this.finished()) {
			logError(
				'Conflict Analysis Error',
				'Conflict analysis is already finished, no more resolution steps can be performed'
			);
		}

		const propagation: VariableAssignment = this.currentImplication();
		const complementary: Lit = Literal.complementary(propagation.toLit());

		if (!this.conflictiveClause.contains(complementary)) {
			logError(
				'Conflict Analysis Error',
				'The current implication does not have its complementary literal in the conflictive clause'
			);
		}

		const r: Propagation = propagation.getReason() as Propagation;
		const reason: Clause = getClausePool().at(r.cRef);
		const resolvent: Clause = this.conflictiveClause.resolution(reason);

		this.updateConflictiveClause(resolvent);
		this.nth += 1;

		// Move the pointer to the next implication to consider
		const { nextPointer, nSteps }: PointerUpdate = this._nextImplicationIndex();
		this.pointer = nextPointer;

		// If after updating the pointer, no asserting literal or no more implications are left
		// There is no next variable to resolve with
		const next: Maybe<Variable> = this.finished()
			? makeNothing()
			: makeJust(this.getImplication(this.pointer).getVariable());

		const resolution: Resolution = {
			nth: this.nth,
			next: {
				over: next,
				nSkip: nSteps
			},
			over: propagation.getVariable(),
			conflictClause: this.conflictiveClause.copy(),
			reason: reason,
			resolvent: {
				clause: resolvent,
				asserting: this._clauseContainsAssertiveLiteral(resolvent)
			}
		};

		return resolution;
	}

	private updateConflictiveClause(resolvent: Clause): void {
		if (!resolvent.violated()) {
			logError(
				'Conflict Analysis Error',
				'The resolvent clause must be falsified to continue conflict analysis'
			);
		}
		// Updates the clause being analyzed
		this.conflictiveClause = resolvent;
	}
}
