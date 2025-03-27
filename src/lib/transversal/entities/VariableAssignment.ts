import { logFatal } from '../utils/logging.ts';
import type Variable from './Variable.svelte.ts';

export enum DecisionCause {
	AUTOMATED = 'Automated',
	MANUAL = 'Manual'
}

type Decision = {
	type: 'Decision';
	cause: DecisionCause;
};

type UP = {
	type: 'UP';
	cause: number;
};

type Backtracking = {
	type: 'Backtracking';
};

export type Reason = UP | Decision | Backtracking;

export default class VariableAssignment {
	variable: Variable;
	reason: Reason;

	private constructor(variable: Variable, reason: Reason) {
		this.variable = variable;
		this.reason = reason;
	}

	//Factory patterns to return VariableAssignment instanses
	static createWithDecision(variable: Variable, cause: DecisionCause) {
		const reason: Reason = {
			type: 'Decision',
			cause
		};
		return new VariableAssignment(variable, reason);
	}

	static createWithUP(variable: Variable, cause: number) {
		const reason: Reason = {
			type: 'UP',
			cause
		};
		return new VariableAssignment(variable, reason);
	}

	static createWithBacktracking(variable: Variable) {
		const reason: Reason = {
			type: 'Backtracking'
		};
		return new VariableAssignment(variable, reason);
	}

	copy(): VariableAssignment {
		return new VariableAssignment(this.variable, this.reason);
	}

	getVariable(): Variable {
		return this.variable;
	}

	private getDecisionCause(): DecisionCause {
		if (!this.isD()) {
			logFatal(
				`Impossible to retrieve cause`,
				`It is not possible to get the decision cause as this variable assignment is a ${this.reason.type}`
			);
		}
		return (this.reason as Decision).cause;
	}

	private getPropagationClause(): number {
		if (!this.isUP) {
			logFatal(
				`Impossible to retrieve clause`,
				`It is not possible to get the propagation clause as this variable assignment is a ${this.reason.type}`
			);
		}
		return (this.reason as UP).cause;
	}

	getCause(): number | DecisionCause {
		if (this.isD()) return this.getDecisionCause();
		else if (this.isUP()) return this.getPropagationClause();
		logFatal(`There is no cause for a Backtracking`);
	}

	isD(): boolean {
		return this.reason.type === 'Decision';
	}

	isUP(): boolean {
		return this.reason.type === 'UP';
	}

	isK(): boolean {
		return this.reason.type === 'Backtracking';
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
		let text: string;
		if (assignment) {
			text = variable.toString();
		} else {
			text = `\\overline{${variable}}`;
		}
		return text;
	}
}
