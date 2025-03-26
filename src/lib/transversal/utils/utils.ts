import Clause from '../entities/Clause.ts';
import Literal from '../entities/Literal.svelte.ts';
import type VariablePool from '../entities/VariablePool.ts';
import { logError } from './logging.ts';
import type { Claims } from './parsers/dimacs.ts';

export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

export function fromClaimsToClause(claims: Claims, variablePool: VariablePool): Clause[] {
	const clauses: Clause[] = [];
	claims.forEach((claim, i) => {
		if (claim.length === 0) {
			logError('Claim to clause', `Claim ${i} is empty. With no EOS`);
		} else {
			const [eos, ...rest] = claim.reverse();
			console.log(claim);
			if (eos === 0) {
				const literals: Literal[] = [];
				rest.forEach((lit) => {
					if (lit === 0) {
						logError(
							'Unexpected literal representation',
							`Found literal '0' which is not a valid representation`
						);
					} else {
						literals.push(
							new Literal(variablePool.get(Math.abs(lit)), lit < 0 ? 'Negative' : 'Positive')
						);
					}
				});
				clauses.push(new Clause(literals));
			} else {
				logError(`Claim's EOS not found`, `Claim ${i} has not EOS`);
			}
		}
	});
	return clauses;
}
