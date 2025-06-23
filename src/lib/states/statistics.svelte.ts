import { getProblemStore } from './problem.svelte.ts';

export interface ClauseCountEntry {
	[key: number]: number;
}

export interface Statistics {
	noDecisions: number;
	noConflicts: number;
	noUnitPropagations: number;
	clausesLeft: ClauseCountEntry;
}

let noDecisions: number = $state(0);
let noConflicts: number = $state(0);
let noUnitPropagations: number = $state(0);
let clausesLeft: ClauseCountEntry = $state({});

export const increaseNoDecisions = (): void => {
	noDecisions += 1;
};

export const increaseNoConflicts = (): void => {
	noConflicts += 1;
};

export const increaseNoUnitPropagations = (): void => {
	noUnitPropagations += 1;
};

export const updateClausesLeft = (nTrail: number): void => {
	const nClauses: number = getProblemStore().clauses.leftToSatisfy();
	clausesLeft[nTrail] = nClauses;
};

export const updateStatistics = (newStatistics: Statistics): void => {
	noDecisions = newStatistics.noDecisions;
	noConflicts = newStatistics.noConflicts;
	noUnitPropagations = newStatistics.noUnitPropagations;
	clausesLeft = newStatistics.clausesLeft;
};

export const resetStatistics = (): void => {
	noDecisions = 0;
	noConflicts = 0;
	noUnitPropagations = 0;
	clausesLeft = {};
};

export const getStatistics = () => {
	return {
		noDecisions: noDecisions,
		noConflicts: noConflicts,
		noUnitPropagations: noUnitPropagations,
		clausesLeft: clausesLeft
	} as Statistics;
};
export const getNoDecisions = () => noDecisions;
export const getNoConflicts = () => noConflicts;
export const getNoUnitPropagations = () => noUnitPropagations;
export const getClausesLeft = () => clausesLeft;
