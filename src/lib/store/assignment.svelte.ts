import { logFatal } from '$lib/transversal/logging.ts';
import { getDefaultPolarity } from './parameters.svelte.ts';

export type ManualAssignment = {
	type: 'manual';
	variable: number;
	polarity: boolean;
};

type AutomatedAssignment = {
	type: 'automated';
	polarity: boolean;
};

export type AssignmentEvent = AutomatedAssignment | ManualAssignment;

let assignment: AssignmentEvent = $state({ type: 'automated', polarity: getDefaultPolarity() });

export const updateAssignment = (
	newType: 'manual' | 'automated',
	newPolarity?: boolean,
	newVariable?: number
): void => {
	if (newType === 'automated') {
		newPolarity = getDefaultPolarity();
		assignment = { type: newType, polarity: newPolarity };
	} else {
		if (newVariable === undefined || newPolarity === undefined) {
			logFatal(
				'No variable | polarity found',
				'Variable && Polarity should be instantiated in a manual assignment'
			);
		}
		assignment = { type: newType, variable: newVariable, polarity: newPolarity };
	}
};

export const getAssignment = () => assignment;
