import { getClausePool } from '$lib/states/problem.svelte.ts';
import { logError } from '$lib/states/toasts.svelte.ts';
import type { Maybe } from '$lib/types/maybe.ts';
import type { Lit, Var } from '$lib/types/types.ts';
import Clause from './Clause.svelte.ts';
import Literal from './Literal.svelte.ts';
import type Variable from './Variable.svelte.ts';
import type VariableAssignment from './VariableAssignment.ts';
import { type Propagation } from './VariableAssignment.ts';

export interface Resolution {
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
	dlAssignments: VariableAssignment[];
	pointer: number = $state(-1);
	nth: number;

	// first UIP (assignment)
	firstUIP: VariableAssignment | undefined = undefined;

	// This is the distance till the next implication to consider in the conflict analysis
	resolutionGap: number = 0;

	constructor(
		conflictClause: Clause,
		decision: VariableAssignment,
		dlPropagations: VariableAssignment[]
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
		if (dlPropagations.length === 0) {
			logError(
				'Conflict Analysis Error',
				'There must be at least one literal from the last decision level in the propagations'
			);
		}

		if (!decision.isD()) {
			logError('Conflict Analysis Error', 'The provided decision assignment is not a decision');
		}

		for (const lit of dlPropagations) {
			if (!lit.isImplied()) {
				logError(
					'Conflict Analysis Error',
					'All literals in the last decision level propagations must be implied literals'
				);
			}
		}
		this.conflictiveClause = conflictClause;
		this.dlAssignments = [decision, ...dlPropagations];

		// Out of the last propagation
		this.pointer = this.dlAssignments.length;
		const { nextPointer, nSteps } = this._nextImplicationIndex();
		this.pointer = nextPointer;

		this.resolutionGap = nSteps;

		// The nth position of the resolution from right-to-left
		this.nth = 0;
	}

	finished(): boolean {
		// Conflict analysis finished when there is
		// no more implications to consider or the current conflictive clause contains the first UIP
		return this.pointer < 1 || this._reachedFirstUIP();
	}

	reachedFirstUIP(): boolean {
		const uip: Maybe<Lit> = this._getUIP(this.conflictiveClause);
		return uip.isJust();
	}

	_reachedFirstUIP(): boolean {
		return this.reachedFirstUIP();
	}

	_getUIP(clause: Clause): Maybe<Lit> {
		return clause.getUIP(this.dlAssignments.map((assignment) => assignment.toLit()));
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
		return this.dlAssignments[this.pointer];
	}

	getImplication(pointer: number): VariableAssignment {
		if (pointer < 0 || pointer >= this.dlAssignments.length) {
			logError(
				'Conflict Analysis Error',
				'No more implications left to consider in conflict analysis'
			);
		}
		return this.dlAssignments[pointer];
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

		const uip: Maybe<Lit> = this._getUIP(resolvent);
		const isUIP: boolean = uip.isJust();

		// Seek for the first UIP in the last decision level propagations
		if (isUIP && this.firstUIP === undefined) {
			// Search the assignment of the first UIP in the last decision assignment level
			const variable: Var = Literal.var(uip.fromJust());
			let p: number = this.pointer;
			let found: boolean = false;
			while (p >= 0 && !found) {
				const assignment: VariableAssignment = this.getImplication(p);
				if (assignment.toVar() === variable) {
					this.firstUIP = assignment;
					found = true;
				} else {
					p -= 1;
				}
			}

			if (!found) {
				logError(
					'Conflict Analysis Error',
					'The first UIP literal is not found in the last decision level propagations'
				);
			}
		}

		this.nth += 1;

		// Move the pointer to the next implication to consider
		const { nextPointer, nSteps }: PointerUpdate = this._nextImplicationIndex();

		this.pointer = nextPointer;
		this.resolutionGap = nSteps;

		const resolution: Resolution = {
			nth: this.nth,
			over: propagation.getVariable(),
			conflictClause: this.conflictiveClause.copy(),
			reason: reason,
			resolvent: {
				clause: resolvent,
				asserting: isUIP
			}
		};

		return resolution;
	}

	getFirstUIP(): VariableAssignment {
		if (!this.reachedFirstUIP()) {
			logError(
				'Conflict Analysis Error',
				'The conflictive clause does not contain a first UIP, cannot return it'
			);
		}
		if (this.firstUIP === undefined) {
			logError(
				'Conflict Analysis Error',
				'The first UIP pointer is undefined, cannot return the first UIP'
			);
		}
		return this.firstUIP as VariableAssignment;
	}

	getResolutionGap(): number {
		return this.resolutionGap;
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
