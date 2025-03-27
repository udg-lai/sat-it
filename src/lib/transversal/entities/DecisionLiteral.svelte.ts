import {
	isNothing,
	makeNothing,
	fromJust,
	type Maybe
} from '$lib/transversal/utils/types/maybe.ts';
import { logFatal } from '../utils/logging.ts';
import type Variable from './Variable.svelte.ts';

export enum AssignmentReason {
	D = 'decision',
	UP = 'unit_propagation',
	K = 'backtracking'
}

export default class DecisionVariable {
	/**
	 * Any instance of the decision literal is evaluated to true
	 */
	variable: Variable;
	reason: AssignmentReason;
	clauseUpId: Maybe<number>;

	constructor(
		variable: Variable,
		reason: AssignmentReason,
		clauseUpId: Maybe<number> = makeNothing()
	) {
		this.variable = variable;
		this.reason = reason;
		this.clauseUpId = clauseUpId;
	}

	copy(): DecisionVariable {
		return new DecisionVariable(this.variable, this.reason, this.clauseUpId);
	}

	getVariable(): Variable {
		return this.variable;
	}

	getSource(): number {
		if (isNothing(this.clauseUpId)) {
			throw 'ERROR: There is no source for the decision';
		}
		return fromJust(this.clauseUpId);
	}

	isD(): boolean {
		return this.reason === AssignmentReason.D;
	}

	isUP(): boolean {
		return this.reason === AssignmentReason.UP;
	}

	isK(): boolean {
		return this.reason === AssignmentReason.K;
	}

	unassign(): void {
		this.variable.unassign();
	}

	toTeX(): string {
		if (this.variable.isNotAssigned()) {
			logFatal(
				'Evaluating a variable assigment with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		const assignment = this.variable.getAssignment();
		const variable = this.variable.getInt();
		if (assignment) {
			return `\\overline{${variable}}`;
		} else {
			return variable.toString();
		}
	}
}
