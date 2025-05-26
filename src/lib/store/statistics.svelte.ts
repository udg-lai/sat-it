export interface Statistics {
	noDecisions: number;
	noConflicts: number;
	noUnitPropagations: number;
}

let noDecisions: number = $state(0);
let noConflicts: number = $state(0);
let noUnitPropagations: number = $state(0);

export const increaseNoDecisions = (): void => {
	noDecisions += 1;
};

export const increaseNoConflicts = (): void => {
	noConflicts += 1;
};

export const increaseNoUnitPropgations = (): void => {
	noUnitPropagations += 1;
};

export const updateStatistics = (newStatistics: Statistics): void => {
	noDecisions = newStatistics.noDecisions;
	noConflicts = newStatistics.noConflicts;
	noUnitPropagations = newStatistics.noUnitPropagations;
};

export const resetStatistics = (): void => {
	noDecisions = 0;
	noConflicts = 0;
	noUnitPropagations = 0;
};

export const getStatistics = () => {
	return {
		noDecisions: noDecisions,
		noConflicts: noConflicts,
		noUnitPropagations: noUnitPropagations
	} as Statistics;
};
export const getNoDecisions = () => noDecisions;
export const getNoConflicts = () => noConflicts;
export const getNoUnitPropagations = () => noUnitPropagations;
