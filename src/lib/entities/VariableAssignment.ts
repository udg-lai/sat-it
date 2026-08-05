import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { Lit, Var } from '$lib/types/types.ts';
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

export const getPropagationCRef = (r: Reason): number => {
	if (!isImpliedReason(r))
		logFatal('Reason is not Propagation', 'Onley Propagation Reasons can have Propagation CRef');
	return r.cRef;
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

export const isImpliedReason = (r: Reason): r is Propagation => {
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
	_variable: Variable;
	_reason: Reason;
	_dl: number = -1;

	private constructor(variable: Variable, kind: Reason, dl: number = -1) {
		this._variable = variable;
		this._reason = kind;
		this._dl = dl;

		console.debug(
			`VariableAssignment created: ${this._variable.toInt()} with reason ${this._reason.type} at decision level ${this._dl}`
		);
	}

	static newAutomatedAssignment(variable: Variable, algorithm: string, dl: number = -1) {
		return new VariableAssignment(variable, makeAutomatedReason(algorithm), dl);
	}

	static newManualAssignment(variable: Variable, dl: number = -1) {
		return new VariableAssignment(variable, makeManualReason(), dl);
	}

	static newUnitPropagationAssignment(variable: Variable, clauseTag: number, dl: number = -1) {
		return new VariableAssignment(variable, makeUnitPropagationReason(clauseTag), dl);
	}

	static newBackJumpingAssignment(variable: Variable, clauseTag: number, dl: number = -1) {
		return new VariableAssignment(variable, makeBackJumpingReason(clauseTag), dl);
	}

	static newBacktrackingAssignment(variable: Variable, dl: number = -1) {
		return new VariableAssignment(variable, makeBacktrackingReason(), dl);
	}

	copy(): VariableAssignment {
		return new VariableAssignment(this._variable, this._reason, this._dl);
	}

	getVariable(): Variable {
		return this._variable;
	}

	dl(): number {
		return this._dl;
	}

	isD(): boolean {
		return isDecisionReason(this._reason);
	}

	isUP(): boolean {
		return isUnitPropagationReason(this._reason);
	}

	isBJ(): boolean {
		return isBackJumpingReason(this._reason);
	}

	isK(): boolean {
		return isBacktrackingReason(this._reason);
	}

	isImplied(): boolean {
		// A literal is implied if it was propagated after backjumping
		// or it was propagated because it occurs into a unit clause
		return isImpliedReason(this._reason);
	}

	getReason(): Reason {
		return this._reason;
	}

	unassign(): void {
		this._variable.unassign();
	}

	toLit(): Lit {
		if (!this._variable.hasTruthValue()) {
			logFatal(
				'Evaluating a variable assignment with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		const assignment = this._variable.getAssignment();
		if (assignment) {
			return this._variable.toInt();
		} else {
			return this._variable.toInt() * -1;
		}
	}

	toVar(): Var {
		return this._variable.toInt();
	}

	toTeX(): string {
		if (!this._variable.hasTruthValue()) {
			logFatal(
				'Evaluating a variable assignment with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		const truthValue: boolean = this._variable.getAssignment() as boolean;
		const variableId = this._variable.toInt();
		let text: string;
		if (truthValue) {
			text = variableId.toString();
		} else {
			text = `\\overline{${variableId}}`;
		}
		return text;
	}
}
