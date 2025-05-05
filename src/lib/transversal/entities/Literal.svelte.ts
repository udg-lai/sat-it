import Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { v4 as uuidv4 } from 'uuid';
import type { Comparable } from '../utils/interfaces/Comparable.ts';
import { logFatal } from '../logging.ts';

export type Polarity = 'Positive' | 'Negative';

export default class Literal implements Comparable<Literal> {
	private id: string;
	private variable: Variable;
	private polarity: Polarity;

	constructor(variable: Variable, polarity: Polarity) {
		this.id = uuidv4();
		this.variable = variable;
		this.polarity = polarity;
	}

	getId() {
		return this.id;
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
		return [
			this.polarity == 'Negative' ? `\\neg` : '',
			this.getVariable().getInt().toString()
		].join('');
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
