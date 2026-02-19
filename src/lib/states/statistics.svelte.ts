let noDecisions: number = $state(0);
let noConflicts: number = $state(0);
let noUnitPropagations: number = $state(0);
let visitedClauses: number = $state(0);

export const increaseNoDecisions = (): void => {
	noDecisions += 1;
};

export const decreaseNoDecision = (): void => {
	noDecisions -= 1;
};

export const increaseNoConflicts = (): void => {
	noConflicts += 1;
};

export const decreaseNoConflicts = (): void => {
	noConflicts -= 1;
};

export const increaseNoUnitPropagations = (): void => {
	noUnitPropagations += 1;
};

export const decreaseNoUnitPropagations = (): void => {
	noUnitPropagations -= 1;
};

export const resetStatistics = (): void => {
	noDecisions = 0;
	noConflicts = 0;
	noUnitPropagations = 0;
	visitedClauses = 0;
};

export const getNoDecisions = () => noDecisions;
export const getNoConflicts = () => noConflicts;
export const getNoUnitPropagations = () => noUnitPropagations;
export const getVisitedClauses = () => visitedClauses;
