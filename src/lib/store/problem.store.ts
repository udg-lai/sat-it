import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { resetTrails } from './trails.store.ts';
import { resetUserActions } from './action.store.ts';

type MappingLiteral2Clauses = Map<number, Set<number>>;

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	algorithm: () => void;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblemDomain(instance: DimacsInstance) {
	const { varCount, cnf: clauses } = instance.summary;

	const variablePool: VariablePool = new VariablePool(varCount);
	const clausePool: ClausePool = ClausePool.buildFrom(clauses, variablePool);
	const mapping: MappingLiteral2Clauses = literalToClauses(clausePool);

	const previousProblem = get(problemStore);

	const params = {
		variables: variablePool,
		clauses: clausePool,
		mapping
	};

	let newProblem: Problem;

	if (previousProblem === undefined) {
		const algorithm = () => console.log('I am dummy ;)');
		newProblem = {
			...params,
			algorithm
		};
	} else {
		const { algorithm } = previousProblem;
		newProblem = {
			...params,
			algorithm
		};
	}

	problemStore.set(newProblem);
	resetTrails();
	resetUserActions();
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore); 
	problemStore.set({ ...currentProblem, ...algorithm });
	updateVariablePool(new VariablePool(currentProblem.variables.capacity));
	resetTrails();
	resetUserActions();
}

export function updateVariablePool(variables: VariablePool) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, variables });
}

function literalToClauses(clauses: ClausePool): MappingLiteral2Clauses {
	const mapping: Map<number, Set<number>> = new Map();

	clauses.getClauses().forEach((clause, clauseId) => {
		clause.getLiterals().forEach((literal) => {
			const literalId = literal.toInt();
			if (mapping.has(literalId)) {
				const s = mapping.get(literalId);
				s?.add(clauseId);
			} else {
				const s = new Set([clauseId]);
				mapping.set(literalId, s);
			}
		});
	});

	return mapping;
}
