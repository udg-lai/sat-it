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

export const isDecisionReason = (r: Reason): r is Decision => {
	return r.type === 'manual' || r.type === 'automated';
};

export const isAutomatedReason = (r: Reason): r is Automated => {
	return r.type === 'automated';
};

export const isManualReason = (r: Reason): r is Manual => {
	return r.type === 'manual';
};

export const isUnitPropagationReason = (r: Reason): r is UnitPropagation => {
	return r.type === 'propagated';
};

export const isBacktrackingReason = (r: Reason): r is Backtracking => {
	return r.type === 'backtracking';
};

export const makeAutomatedReason = (algorithm: string): Automated => {
	return {
		type: 'automated',
		algorithm
	};
};

export const makeManualReason = (): Manual => {
	return {
		type: 'manual'
	};
};

export const makeUnitPropagationReason = (clauseId: number): UnitPropagation => {
	return {
		type: 'propagated',
		clauseId
	};
};

export const makeBacktrackingReason = (): Backtracking => {
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
		return new VariableAssignment(variable, makeAutomatedReason(algorithm));
	}

	static newManualAssignment(variable: Variable) {
		return new VariableAssignment(variable, makeManualReason());
	}

	static newUnitPropagationAssignment(variable: Variable, clauseId: number) {
		return new VariableAssignment(variable, makeUnitPropagationReason(clauseId));
	}

	static newBacktrackingAssignment(variable: Variable) {
		return new VariableAssignment(variable, makeBacktrackingReason());
	}

	copy(): VariableAssignment {
		return new VariableAssignment(this.variable, this.reason);
	}

	getVariable(): Variable {
		return this.variable;
	}

	isD(): boolean {
		return isDecisionReason(this.reason);
	}

	isUP(): boolean {
		return isUnitPropagationReason(this.reason);
	}

	isK(): boolean {
		return isBacktrackingReason(this.reason);
	}

	getReason(): Reason {
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
