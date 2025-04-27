import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { Eval } from '../interfaces/IClausePool.ts';
import {
	backtrackingName,
	backtrackingAlgorithm,
	backtrackingPreprocessing,
	backtrackingConflictDetection
} from '$lib/transversal/algorithms/backtracking.ts';

export interface AlgorithmParams {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	trails: Trail[];
	previousEval: Eval;
}

export type AssignmentResult = {
	eval: Eval;
	end: boolean;
	trails: Trail[];
};

export type PreprocessingReturn = {
	eval: Eval;
	end: boolean;
};

export type ConflictDetecionParams = {
	workingTrail: Trail;
	variables: VariablePool;
	clauses: ClausePool;
	clausesToCheck?: Set<number> | undefined;
};

export type ConflictDetecionReturn = {
	eval: Eval;
	end: boolean;
};

export type AlgorithmStep = (params: AlgorithmParams) => AssignmentResult;
export type Preprocessing = (clauses: ClausePool) => PreprocessingReturn;
export type ConflictDetecion = (params: ConflictDetecionParams) => ConflictDetecionReturn;

export type Algorithm = {
	name: string;
	preprocessing: Preprocessing;
	step: AlgorithmStep;
	conflictDetection: ConflictDetecion;
};

export const backtracking: Algorithm = {
	name: backtrackingName,
	preprocessing: backtrackingPreprocessing,
	step: backtrackingAlgorithm,
	conflictDetection: backtrackingConflictDetection
};
