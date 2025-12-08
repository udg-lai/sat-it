import { logFatal } from '$lib/states/toasts.svelte.ts';
import type Variable from './Variable.svelte.ts';

export type Automated = {
	type: 'automated';
	algorithm: string;
};

export type Manual = {
	type: 'manual';
};

export type Decision = Automated | Manual;

export type UnitPropagation = {
	type: 'propagated';
	cRef: number;
};

export type BackJumping = {
	type: 'backjumping';
	cRef: number;
};

export type Propagation = UnitPropagation | BackJumping;

export type Backtracking = {
	type: 'backtracking';
};

export type Reason = Decision | Propagation | Backtracking;

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

export const isBackJumpingReason = (r: Reason): r is BackJumping => {
	return r.type === 'backjumping';
};

export const isPropagationReason = (r: Reason): r is Propagation => {
	return r.type === 'propagated' || r.type === 'backjumping';
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

export const makeUnitPropagationReason = (clauseTag: number): UnitPropagation => {
	return {
		type: 'propagated',
		cRef: clauseTag
	};
};

export const makeBackJumpingReason = (clauseTag: number): BackJumping => {
	return {
		type: 'backjumping',
		cRef: clauseTag
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

	static newUnitPropagationAssignment(variable: Variable, clauseTag: number) {
		return new VariableAssignment(variable, makeUnitPropagationReason(clauseTag));
	}

	static newBackJumpingAssignment(variable: Variable, clauseTag: number) {
		return new VariableAssignment(variable, makeBackJumpingReason(clauseTag));
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

	isBJ(): boolean {
		return isBackJumpingReason(this.reason);
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

	toInt(): number {
		const assignment = this.variable.getAssignment();
		if (assignment) {
			return this.variable.toInt();
		} else {
			return this.variable.toInt() * -1;
		}
	}

	variableId(): number {
		return this.variable.toInt();
	}

	toTeX(): string {
		if (!this.variable.hasTruthValue()) {
			logFatal(
				'Evaluating a variable assignment with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		const truthValue: boolean = this.variable.getAssignment() as boolean;
		const variableId = this.variable.toInt();
		let text: string;
		if (truthValue) {
			text = variableId.toString();
		} else {
			text = `\\overline{${variableId}}`;
		}
		return text;
	}
}
