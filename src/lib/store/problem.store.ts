import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';

type Variable2Clauses = Map<number, Set<number>>;

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: Variable2Clauses;
	algorithm: () => void;
}

export const problemStore: Writable<Problem> = writable();

export function updateProblemDomain(instance: DimacsInstance) {
	const { summary } = instance;
	const { claims } = summary;
	const variables: VariablePool = new VariablePool(summary.varCount);
	const clauses: ClausePool = ClausePool.buildFrom(claims.simplified, variables);
	const mapping: Variable2Clauses = variablesToClauses(variables, clauses);

	const previousProblem = get(problemStore);

	const params = {
		variables,
		clauses,
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
}

export function updateAlgorithm(algorithm: () => void) {
	const currentProblem = get(problemStore);
	problemStore.set({ ...currentProblem, ...algorithm });
}

function variablesToClauses(variables: VariablePool, clauses: ClausePool): Variable2Clauses {
	const mapping: Map<number, Set<number>> = new Map();

	clauses.getClauses().forEach((clause, clauseId) => {
		clause.getLiterals().forEach((literal) => {
			const variableId = Math.abs(literal.toInt());
			if (mapping.has(variableId)) {
				const s = mapping.get(variableId);
				s?.add(clauseId);
			} else {
				const s = new Set([clauseId]);
				mapping.set(variableId, s);
			}
		});
	});

	const addedVariables = new Set(mapping.keys());
	const allVariables = new Set(variables.getVariablesIDs());
	const diff = allVariables.difference(addedVariables);

	for (const variableId of diff) {
		mapping.set(variableId, new Set());
	}

	return mapping;
}
