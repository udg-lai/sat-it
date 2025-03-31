import { logFatal } from '../utils/logging.ts';
import type Variable from './Variable.svelte.ts';

type Automated = {
	type: 'automated';
	algorithm: string;
};

type Manual = {
	type: 'manual';
};

type Decision = Automated | Manual;

type UnitPropagation = {
	type: 'propagated';
	clauseId: number;
};

type Backtracking = {
	type: 'backtracking';
};

export type AssignmentKind = Decision | UnitPropagation | Backtracking;

export const isDecisionAssignment = (a: AssignmentKind): a is Decision => {
	return a.type === 'manual' || a.type === 'automated';
};

export const isAutomatedAssignment = (a: AssignmentKind): a is Automated => {
	return a.type === 'automated';
};

export const isManualAssignment = (a: AssignmentKind): a is Manual => {
	return a.type === 'manual';
};

export const isUnitPropagationAssignment = (a: AssignmentKind): a is UnitPropagation => {
	return a.type === 'propagated';
};

export const isBacktrackingAssignment = (a: AssignmentKind): a is Backtracking => {
	return a.type === 'backtracking';
};

export const makeAutomatedAssignment = (algorithm: string): Automated => {
	return {
		type: 'automated',
		algorithm
	};
};

export const makeManualAssignment = (): Manual => {
	return {
		type: 'manual'
	};
};

export const makeUnitPropagationAssignment = (clauseId: number): UnitPropagation => {
	return {
		type: 'propagated',
		clauseId
	};
};

export const makeBacktrackingAssignment = (): Backtracking => {
	return {
		type: 'backtracking'
	};
};

export default class VariableAssignment {
	variable: Variable;
	assignmentKind: AssignmentKind;

	private constructor(variable: Variable, kind: AssignmentKind) {
		this.variable = variable;
		this.assignmentKind = kind;
	}

	static newAutomatedAssignment(variable: Variable, algorithm: string) {
		return new VariableAssignment(variable, makeAutomatedAssignment(algorithm));
	}

	static newManualAssignment(variable: Variable) {
		return new VariableAssignment(variable, makeManualAssignment());
	}

	static newUnitPropagationAssignment(variable: Variable, clauseId: number) {
		return new VariableAssignment(variable, makeUnitPropagationAssignment(clauseId));
	}

	static newBacktrackingAssignment(variable: Variable) {
		return new VariableAssignment(variable, makeBacktrackingAssignment());
	}

	copy(): VariableAssignment {
		return new VariableAssignment(this.variable, this.assignmentKind);
	}

	getVariable(): Variable {
		return this.variable;
	}

	isD(): boolean {
		return isDecisionAssignment(this.assignmentKind);
	}

	isUP(): boolean {
		return isUnitPropagationAssignment(this.assignmentKind);
	}

	isK(): boolean {
		return isBacktrackingAssignment(this.assignmentKind);
	}

	getAssignmentKind(): AssignmentKind {
		return this.assignmentKind;
	}

	unassign(): void {
		this.variable.unassign();
	}

	toTeX(): string {
		if (this.variable.isNotAssigned()) {
			logFatal(
				'Evaluating a variable assignment with not assigned value',
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
