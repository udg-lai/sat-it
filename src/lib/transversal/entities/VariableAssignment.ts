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

export type Reason = Decision | UnitPropagation | Backtracking;

export const isDecisionAssignment = (r: Reason): r is Decision => {
	return r.type === 'manual' || r.type === 'automated';
};

export const isAutomatedAssignment = (r: Reason): r is Automated => {
	return r.type === 'automated';
};

export const isManualAssignment = (r: Reason): r is Manual => {
	return r.type === 'manual';
};

export const isUnitPropagationAssignment = (r: Reason): r is UnitPropagation => {
	return r.type === 'propagated';
};

export const isBacktrackingAssignment = (r: Reason): r is Backtracking => {
	return r.type === 'backtracking';
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
	reason: Reason;

	private constructor(variable: Variable, kind: Reason) {
		this.variable = variable;
		this.reason = kind;
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
		return new VariableAssignment(this.variable, this.reason);
	}

	getVariable(): Variable {
		return this.variable;
	}

	isD(): boolean {
		return isDecisionAssignment(this.reason);
	}

	isUP(): boolean {
		return isUnitPropagationAssignment(this.reason);
	}

	isK(): boolean {
		return isBacktrackingAssignment(this.reason);
	}

	getAssignmentKind(): Reason {
		return this.reason;
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
