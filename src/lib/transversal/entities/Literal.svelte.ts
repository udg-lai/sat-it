import Variable from '$lib/transversal/entities/Variable.svelte.ts';
import { v4 as uuidv4 } from 'uuid';
import type { Comparable } from '../utils/interfaces/Comparable.ts';

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

	public isDefined(): boolean {
		return this.variable.isAssigned();
	}

	public evaluate(): boolean {
		let evaluation = this.variable.getAssignment();
		if (this.polarity === 'Negative') evaluation = !evaluation;
		return evaluation;
	}

	public isTrue(): boolean {
		return this.isDefined() && this.evaluate();
	}

	public isFalse(): boolean {
		return this.isDefined() && !this.evaluate();
	}

	public toTeX(): string {
		return [this.polarity == 'Negative' ? `\\neg` : '', this.getVariable().getId().toString()].join(
			''
		);
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
