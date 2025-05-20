interface Statistics {
	noDecisions: number;
	noBacktrackings: number;
	noUnitPropagations: number;
}

const statistics: Statistics = $state({ noDecisions: 0, noBacktrackings: 0, noUnitPropagations: 0 });

export const increaseNoDecisions = (): void => {
	statistics.noDecisions += 1;
};

export const increaseNoBacktrackings = (): void => {
	statistics.noBacktrackings += 1;
};

export const increaseNoUnitPropgations = (): void => {
	statistics.noUnitPropagations += 1;
};

export const updateNoDecisions = (newDecisions: number): void => {
	statistics.noDecisions = newDecisions;
};

export const updateNoBacktracking = (newBacktrackings: number): void => {
	statistics.noBacktrackings = newBacktrackings;
};

export const updateNoUnitPropagations = (newUnitPropagations: number): void => {
	statistics.noUnitPropagations = newUnitPropagations;
};

export const resetStatistics = (): void => {
	statistics.noDecisions = 0;
	statistics.noBacktrackings = 0;
	statistics.noUnitPropagations = 0;
};

export const getStatistics = () => statistics;
export const getNoDecisions = () => statistics.noDecisions;
export const getNoBacktarcking = () => statistics.noBacktrackings;
export const getNoUnitPropagations = () => statistics.noUnitPropagations;
