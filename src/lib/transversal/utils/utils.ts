import Clause from '../entities/Clause.ts';
import Literal from '../entities/Literal.svelte.ts';
import type VariablePool from '../entities/VariablePool.ts';
import type { Claims } from './parsers/dimacs.ts';

export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

export function fromClaimsToClause(claims: Claims, varialePool: VariablePool): Clause[] {
	const clauseCollection: Clause[] = [];
	claims.forEach((line) => {
		const literalCollection: Literal[] = [];
		line.forEach((value) => {
			if (value !== 0) {
				literalCollection.push(
					new Literal(varialePool.get(Math.abs(value)), value < 0 ? 'Negative' : 'Positive')
				);
			}
		});
		clauseCollection.push(new Clause(literalCollection));
	});
	return clauseCollection;
}
