import Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { v4 as uuidv4 } from 'uuid';
import type { Comparable } from '../utils/interfaces/Comparable.ts';
import { fromJust, isNothing } from '../utils/types/maybe.ts';

export type Polarity = 'Positive' | 'Negative';

export default class Literal implements Comparable<Literal> {
	id: string;
	variable: Variable;
	polarity: Polarity;

	constructor(variable: Variable, polarity: Polarity) {
		this.id = uuidv4();
		this.variable = variable;
		this.polarity = polarity;
	}

	public getId() {
		return this.id;
	}

	public getVariable() {
		return this.variable;
	}

	public getPolarity() {
		return this.polarity;
	}

	public isAssigned(): boolean {
		return this.variable.isAssigned();
	}

	public evaluate(): boolean {
		const mb_evaluation = this.variable.getAssignment();
		if (isNothing(mb_evaluation)) {
			throw Error('The literal is not yet assigned');
		}
		let evaluation = fromJust(mb_evaluation);
		if (this.polarity === 'Negative') evaluation = !evaluation;
		return evaluation;
	}

	/*Both functions isTrue and isFlase, will execute the function "evaluate" only if the function "isAssigned" is true*/
	public isTrue(): boolean {
		return this.isAssigned() && this.evaluate();
	}

	public isFalse(): boolean {
		return this.isAssigned() && !this.evaluate();
	}

	public toTeX(): string {
		return [
			this.polarity == 'Negative' ? `\\neg` : '',
			this.getVariable().getInt().toString()
		].join('');
	}

	public equals(other: Literal): boolean {
		return this.toInt() === other.toInt();
	}

	public toInt(): number {
		return this.variable.id * (this.polarity === 'Negative' ? -1 : 1);
	}

	public copy(): Literal {
		return new Literal(this.variable, this.polarity);
	}
}
