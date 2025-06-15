import Clause from './entities/Clause.ts';
import Literal from './entities/Literal.svelte.ts';
import { VariablePool } from '$lib/transversal/entities/VariablePool.svelte.ts';
import { logWarning } from '$lib/store/toasts.ts';
import type { CNF } from './mapping/contentToSummary.ts';

export function disableContextMenu(event: Event): void {
	event.preventDefault();
}

export function enableContextMenu(event: Event) {
	event.stopPropagation(); // Prevent global listener from triggering
}

function literalSetToClause(literals: number[], variables: VariablePool): Clause {
	let clause;
	literals = literals.filter((lit) => lit !== 0);
	if (literals.length === 0) {
		logWarning('Literals to clause', 'An empty clause has been created');
		clause = new Clause();
	} else {
		const literalInstances = literals.map((lit) => {
			const variable = Math.abs(lit);
			const polarity = lit < 0 ? 'Negative' : 'Positive';
			const literal = new Literal(variables.getVariable(variable), polarity);
			return literal;
		});
		clause = new Clause(literalInstances);
	}
	return clause;
}

export function cnfToClauseSet(cnf: CNF, variables: VariablePool): Clause[] {
	return cnf.map((literals) => literalSetToClause(literals, variables));
}

export const runningOnChrome = (): boolean => {
	const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	return isChrome;
};

export const modifyLiteralWidth = (varCount: number): void => {
	const width =
		varCount >= 1000 ? 'var(--trail-literal-large-width)' : 'var(--trail-literal-standard)';
	document.documentElement.style.setProperty('--trail-literal-min-width', width);
};
