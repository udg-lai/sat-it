import { logFatal } from '../utils/logging.ts';
import type Variable from './Variable.svelte.ts';

interface Automated {
	algorithm: string
}

type DecisionReason = Automated | 'Manual'

type ClauseReason = number

export type AssignmentReason = DecisionReason | ClauseReason;

type AssignmentKind = "Decision" | "UP" | "Backtracking"

export default class VariableAssignment {
	variable: Variable;
	assignmentKind: AssignmentKind;
	reason: AssignmentReason | undefined;

	private constructor(variable: Variable, kind: AssignmentKind, reason?: AssignmentReason) {
		this.variable = variable;
		this.assignmentKind = kind;
		this.reason = reason;
	}

	static newAutomatedAssignment(variable: Variable, algorithm: string) {
		return VariableAssignment.newDecisionAssignment(variable, { algorithm })
	}

	static newDecisionAssignment(variable: Variable, reason: DecisionReason) {
		return new VariableAssignment(variable, "Decision", reason);
	}

	static newUPAssignment(variable: Variable, clauseId: ClauseReason) {
		return new VariableAssignment(variable, "UP", clauseId);
	}

	static newAssignmentBacktracking(variable: Variable) {
		return new VariableAssignment(variable, "Backtracking");
	}

	copy(): VariableAssignment {
		return new VariableAssignment(this.variable, this.assignmentKind, this.reason);
	}

	getVariable(): Variable {
		return this.variable;
	}

	getReason(): AssignmentReason | undefined {
		return this.reason;
	}

	isD(): boolean {
		return this.assignmentKind === "Decision";
	}

	isUP(): boolean {
		return this.assignmentKind === 'UP';
	}

	isK(): boolean {
		return this.assignmentKind === 'Backtracking';
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
