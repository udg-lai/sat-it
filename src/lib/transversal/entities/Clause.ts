import logicResolution from '../algorithms/resolution.ts';
import type Literal from './Literal.svelte.ts';
import TemporalClause from './TemporalClause.ts';

class Clause extends TemporalClause {
	private static idGenerator: number = 0;
	private id: number;

	constructor(literals: Literal[] = []) {
		super(literals);
		this.id = this.generateUniqueId();
	}

	static resetUniqueIdGenerator() {
		Clause.idGenerator = 0;
	}

	static nextUniqueId() {
		return Clause.idGenerator;
	}

	copy(): Clause {
		const newClause = new Clause(this.getLiterals());
		return newClause;
	}

	generateUniqueId() {
		const id = Clause.idGenerator;
		Clause.idGenerator += 1;
		return id;
	}

	getId(): number {
		return this.id;
	}

	setId(newId: number): void {
		this.id = newId;
	}

	override resolution(other: TemporalClause): Clause {
		const result: TemporalClause = logicResolution(this, other);
		return new Clause(result.getLiterals());
	}
}
export default Clause;
