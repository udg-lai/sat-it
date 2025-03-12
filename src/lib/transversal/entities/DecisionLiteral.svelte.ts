import {
	isNothing,
	makeNothing,
	fromJust,
	type Maybe
} from '$lib/transversal/utils/types/maybe.ts';
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

	public copy(): DecisionVariable {
		return new DecisionVariable(this.variable, this.reason, this.clauseUpId);
	}

	public getVariable(): Variable {
		return this.variable;
	}

	public getSource(): number {
		if (isNothing(this.clauseUpId)) {
			throw 'ERROR: There is no source for the decision';
		}
		return fromJust(this.clauseUpId);
	}

	public isD(): boolean {
		return this.reason === AssignmentReason.D;
	}

	public isUP(): boolean {
		return this.reason === AssignmentReason.UP;
	}

	public isK(): boolean {
		return this.reason === AssignmentReason.K;
	}

	public unassign(): void {
		this.variable.unassign();
	}

	public toTeX(): string {
		const assignment = this.variable.getAssignment();
		if (isNothing(assignment)) {
			throw Error('No TeX representation for un assigned decision variable');
		} else {
			const truthAssignment = fromJust(assignment);
			const variable = this.variable.getInt();
			if (truthAssignment) {
				return `\\overline{${variable}}`;
			} else {
				return variable.toString();
			}
		}
	}
}
