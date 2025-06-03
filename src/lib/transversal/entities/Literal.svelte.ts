import Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { logFatal } from '$lib/store/toasts.ts';
import type { Comparable } from '../interfaces/Comparable.ts';

export type Polarity = 'Positive' | 'Negative';

export default class Literal implements Comparable<Literal> {
	private variable: Variable;
	private polarity: Polarity;

	constructor(variable: Variable, polarity: Polarity) {
		this.variable = variable;
		this.polarity = polarity;
	}

	getVariable() {
		return this.variable;
	}

	getPolarity() {
		return this.polarity;
	}

	isAssigned(): boolean {
		return this.variable.isAssigned();
	}

	/*Both functions isTrue and isFlase, will execute the function "evaluate" only if the function "isAssigned" is true*/
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

	copy(): Literal {
		return new Literal(this.variable, this.polarity);
	}

	private evaluate(): boolean {
		if (this.variable.isNotAssigned()) {
			logFatal(
				'Evaluating a literal with not assigned value',
				'The evaluation is given by its variable which is not yet assigned'
			);
		}
		let evaluation = this.variable.getAssignment();
		if (this.polarity === 'Negative') evaluation = !evaluation;
		return evaluation;
	}
}
