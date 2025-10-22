import { logFatal } from '$lib/stores/toasts.svelte.ts';
import type { Comparable } from '../interfaces/Comparable.ts';
import type Variable from './Variable.svelte.ts';
import type { VariablePool } from './VariablePool.svelte.ts';

export type Polarity = 'Positive' | 'Negative';

export default class Literal implements Comparable<Literal> {
	private variable: Variable;
	private polarity: Polarity;

	constructor(variable: Variable, polarity: Polarity) {
		this.variable = variable;
		this.polarity = polarity;
	}

	static buildFrom(literal: number, variables: VariablePool) {
		const variable = Math.abs(literal);
		const polarity = literal < 0 ? 'Negative' : 'Positive';
		return new Literal(variables.getVariable(variable), polarity);
	}

	getVariable() {
		return this.variable;
	}

	getPolarity() {
		return this.polarity;
	}

	isAssigned(): boolean {
		return this.variable.hasTruthValue();
	}

	/*Both functions isTrue and isFalse, will execute the function "evaluate" only if the function "isAssigned" is true*/
	isTrue(): boolean {
		return this.isAssigned() && this.evaluate();
	}

	isFalse(): boolean {
		return this.isAssigned() && !this.evaluate();
	}

	toTeX(): string {
		const variable = this.variable.getInt();
		return this.polarity == 'Negative' ? `\\overline{${variable}}` : `${variable}`;
	}

	equals(other: Literal): boolean {
		return this.toInt() === other.toInt();
	}

	toInt(): number {
		return this.variable.getInt() * (this.polarity === 'Negative' ? -1 : 1);
	}

	private evaluate(): boolean {
		if (!this.variable.hasTruthValue()) {
			logFatal(
				'Evaluating a literal with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		let truthValue: boolean = this.variable.getAssignment() as boolean;
		if (this.polarity === 'Negative') truthValue = !truthValue;
		return truthValue;
	}
}
