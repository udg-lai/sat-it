import { getClausePool } from '$lib/states/problem.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import { makeLeft, makeRight, type Either } from '$lib/types/either.ts';
import type { Lit } from '$lib/types/types.ts';
import Clause from './Clause.svelte.ts';
import Literal from './Literal.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type Propagation } from './VariableAssignment.ts';

export interface Resolution {
	nSkippedResolutions: number;
	conflictClause: Clause;
	reason: Clause;
	resolvent: {
		clause: Clause;
		asserting: boolean;
	};
}

export type VirtualResolution = Either<Clause, Resolution>;

export class ConflictAnalysis {
	conflictiveClause: Clause;
	decision: VariableAssignment;
	ldlPropagations: VariableAssignment[];
	pointer: number;
	skipFakeResolutions: boolean;

	constructor(
		conflictClause: Clause,
		decision: VariableAssignment,
		ldlPropagations: VariableAssignment[],
		skipFakeResolutions: boolean = true
	) {
		if (conflictClause.isEmpty()) {
			logError(
				'Conflict Analysis Error',
				'Conflictive clause can not contain the empty clause'
			);
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
		this.pointer = ldlPropagations.length - 1;
		this.skipFakeResolutions = skipFakeResolutions;
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

	virtualResolution(): VirtualResolution {
		// If the complementary literal of the current assignment appears in `this.clause`, we perform a resolution step
		// otherwise, the resulting clause is the same as `this.clause`
		if (this.finished()) {
			logError(
				'Conflict Analysis Error',
				'Conflict analysis is already finished, no more resolution steps can be performed'
			);
		}

		// Where the pointer was before the resolution/s steps
		const sPointer: number = this.pointer;

		if (this.skipFakeResolutions)
		{
			// Find next reason to apply resolution with the current conflictive clause
			let reasonFound: boolean = false;
			while (!reasonFound && this.pointer >= 0)
			{
				const propagation: VariableAssignment = this.currentImplication();
				const complementary: Lit = Literal.complementary(propagation.toLit());

				if (this.conflictiveClause.contains(complementary))
					reasonFound = true;
				else
					this.pointer -= 1;
			}
		}

		const propagation: VariableAssignment = this.currentImplication();
		const complementary: Lit = Literal.complementary(propagation.toLit());
		let resolution: VirtualResolution;

		if (this.conflictiveClause.contains(complementary))
		{
			const r: Propagation = propagation.getReason() as Propagation;
			const reason: Clause = getClausePool().at(r.cRef);
			const resolvent: Clause = this.conflictiveClause.resolution(reason);

			this.updateConflictiveClause(resolvent);

			console.debug(`Number of skipped resolutions: ${sPointer - this.pointer}`);

			resolution = makeRight({
				nSkippedResolutions: sPointer - this.pointer,
				conflictClause: this.conflictiveClause.copy(),
				reason: reason,
				resolvent: {
					clause: resolvent,
					asserting: this._clauseContainsAssertiveLiteral(resolvent)
				}
			});
		}
		else
		{
			// No resolution is performed, the clause remains the same
			resolution = makeLeft(this.conflictiveClause.copy());
		}

		// Move the pointer to the next implication to consider
		this.pointer -= 1;

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
