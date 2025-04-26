import type { MappingLiteral2Clauses } from '$lib/store/problem.store.ts';
import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
import type { Eval } from '../interfaces/IClausePool.ts';
import {
	backtrackingName,
	backtrackingAlgorithm,
	backtrackingPreprocessing
} from '$lib/transversal/algorithms/backtracking.ts';

export interface AlgorithmParams {
	variables: VariablePool;
	clauses: ClausePool;
	mapping: MappingLiteral2Clauses;
	trails: Trail[];
	previousEval: Eval;
}

export type AlgorithmReturn = {
	eval: Eval;
	end: boolean;
	trails: Trail[];
};
export type PreprocessingReturn = {
	eval: Eval;
	end: boolean;
};

export type AlgorithmStep = (params: AlgorithmParams) => AlgorithmReturn;
export type Preprocessing = (clauses: ClausePool) => PreprocessingReturn;

export type Algorithm = {
	name: string;
	preprocessing: Preprocessing;
	step: AlgorithmStep;
};

export const backtracking: Algorithm = {
	name: backtrackingName,
	preprocessing: backtrackingPreprocessing,
	step: backtrackingAlgorithm
};
