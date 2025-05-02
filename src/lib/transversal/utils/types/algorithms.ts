import type { MappingLiteral2Clauses } from "$lib/store/problem.store.ts";
import { dpllAlgorithmStep, dpllConflictDetection, dpllname, dpllPreprocesCD, dpllPreprocesUnitClause, dpllUnitPropagation } from "$lib/transversal/algorithms/dpll.ts";
import type Clause from "$lib/transversal/entities/Clause.ts";
import type ClausePool from "$lib/transversal/entities/ClausePool.svelte.ts";
import type { Trail } from "$lib/transversal/entities/Trail.svelte.ts";
import type VariablePool from "$lib/transversal/entities/VariablePool.svelte.ts";
import { preprocess } from "svelte/compiler";
import type { Eval } from "../interfaces/IClausePool.ts";

export type PreprocesCDParams = {
  clauses: ClausePool;
}

export type PreprocesCDRetur = {
  evaluation:Eval;
}

export type PreprocesUnitClauseParams = {
  clauses: ClausePool
}

export type PreprocesUnitClauseReturn = {
	unitClauses: Eval;
};

export interface StepParams {
	variables: VariablePool;
	mapping: MappingLiteral2Clauses;
	trails: Trail[];
	previousEval: Eval;
}

export type StepResult = {
	clausesToCheck: Set<number>;
};

export type UnitPropagationParams = {
  variables: VariablePool;
	mapping: MappingLiteral2Clauses;
	trails: Trail[];
	previousEval: Eval;
};

export type UnitPropagationReturn = {
  literalToDecide: number;
  variables: VariablePool;
  mapping: MappingLiteral2Clauses;
  
};

export type ConflictDetectionParams = {
  clause: Clause;
};

export type ConflictDetectionReturn = {
	eval: Eval;
};

export type AlgorithmStep = (params: StepParams) => StepResult;

export type Preprocessing = {
  conflictDetection: (params: PreprocesCDParams) => PreprocesCDRetur;
  unitClauses?: (params: PreprocesUnitClauseParams) => PreprocesUnitClauseReturn;
}
export type ConflictDetecion = (params: ConflictDetectionParams) => ConflictDetectionReturn;

export type UnitPropagationStep = (params: UnitPropagationParams) => UnitPropagationReturn;

export type Algorithm = {
	name: string;
	preprocessing: Preprocessing;
	step: AlgorithmStep;
	conflictDetection: ConflictDetecion;
  UPstep?: UnitPropagationStep;
};

export const dpll: Algorithm = {
  name: dpllname,
  preprocessing: {
    conflictDetection: dpllPreprocesCD,
    unitClauses: dpllPreprocesUnitClause
  },
  step: dpllAlgorithmStep,
  conflictDetection: dpllConflictDetection,
  UPstep: dpllUnitPropagation
};