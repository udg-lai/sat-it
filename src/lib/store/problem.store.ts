import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import { get, writable, type Writable } from 'svelte/store';
import VariablePool from '../transversal/entities/VariablePool.svelte.ts';
import type { DimacsInstance } from '$lib/dimacs/dimacs-instance.interface.ts';
import { resetStack } from './stack.svelte.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import { setSolverStateMachine } from './stateMachine.svelte.ts';

export type MappingLiteral2Clauses = Map<number, Set<number>>;

export type Algorithm = 'backtracking' | 'dpll' | 'cdcl';

export interface Problem {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	algorithm: Algorithm;
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
		const algorithm: Algorithm = 'dpll';
		setSolverStateMachine(algorithm);
		newProblem = {
			...params,
			algorithm
		};
	} else {
		const { algorithm } = previousProblem;
		setSolverStateMachine(algorithm);
		newProblem = {
			...params,
			algorithm
		};
	}

	problemStore.set(newProblem);
	resetStack();
}

export function updateAlgorithm(algorithm: Algorithm) {
	const currentProblem = get(problemStore);
	currentProblem.variables.reset();
	setSolverStateMachine(algorithm);
	problemStore.set({ ...currentProblem, algorithm });
	resetStack();
}

export function updateProblemFromTrail(trail: Trail) {
	const { variables, ...currentProblem } = get(problemStore);
	variables.reset();
	trail.forEach((value) => {
		const variable = value.getVariable();
		variables.persist(variable.getInt(), variable.getAssignment());
	});
	problemStore.set({ ...currentProblem, variables });
}

export function resetProblem() {
	const problem: Problem = get(problemStore);
	problem.variables.reset();
	problemStore.set({ ...problem });
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
