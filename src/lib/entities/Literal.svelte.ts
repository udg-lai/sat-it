import { logFatal } from '$lib/states/toasts.svelte.ts';
import type { Lit, Var } from '$lib/types/types.ts';
import type { Comparable } from '../interfaces/Comparable.ts';
import type Variable from './Variable.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

// Entity that appears inside a clause. Some of this literals
// might not have an assigned truth value until the variable is assigned.
export default class Literal implements Comparable<Literal> {
	private variable: Variable;
	private hat: boolean;

	constructor(variable: Variable, hat: boolean) {
		this.variable = variable;
		this.hat = hat;
	}

	static buildFrom(literal: number, variables: VariablePool) {
		const variable = Math.abs(literal);
		return new Literal(variables.getVariable(variable), Literal.hatted(literal));
	}

	static complementary(literal: number): Lit {
		return -1 * literal;
	}

	static hatted(literal: Lit): boolean {
		// Any negative literal is considered to have a hat
		return literal < 0;
	}

	static var(literal: Lit): Var {
		return Math.abs(literal);
	}

	static toLit(varId: Var, hat: boolean): Lit {
		if (varId <= 0) {
			logFatal('Literal.toLit', 'Variable IDs must be positive integers');
		}
		return hat ? -1 * varId : varId;
	}

	getVariable(): Variable {
		return this.variable.copy();
	}

	hasTruthValue(): boolean {
		return this.variable.hasTruthValue();
	}

	/*Both functions isTrue and isFalse, will execute the function "evaluate" only if the function "isAssigned" is true*/
	isTrue(): boolean {
		return this.hasTruthValue() && this.evaluate();
	}

	isFalse(): boolean {
		return this.hasTruthValue() && !this.evaluate();
	}

	toTeX(): string {
		const variable = this.variable.toInt();
		return this.hat ? `\\overline{${variable}}` : `${variable}`;
	}

	equals(other: Literal): boolean {
		return this.toInt() === other.toInt();
	}

	toInt(): number {
		return this.variable.toInt() * (this.hat ? -1 : 1);
	}

	private evaluate(): boolean {
		if (!this.variable.hasTruthValue()) {
			logFatal(
				'Evaluating a literal with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		let truthValue: boolean = this.variable.getAssignment() as boolean;
		if (this.hat) truthValue = !truthValue;
		return truthValue;
	}

	toString(): string {
		return this.toInt().toString();
	}
}
