import { logFatal } from '$lib/transversal/logging.ts';

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

let defaultPolarity: boolean = $state(true);

let assignment: AssignmentEvent = $state({ type: 'automated', polarity: defaultPolarity });

export const updateAssignment = (
	newType: 'manual' | 'automated',
	newPolarity?: boolean,
	newVariable?: number
): void => {
	if (newType === 'automated') {
		newPolarity = defaultPolarity;
		assignment = { type: newType, polarity: newPolarity };
	} else {
		if (newVariable === undefined || newPolarity === undefined) {
			logFatal(
				'No variable | polarity found',
				'Variable && Polarity should be instanciated in a manual assignment'
			);
		}
		assignment = { type: newType, variable: newVariable, polarity: newPolarity };
	}
};

export const updateDefaultPolarity = (): void => {
	defaultPolarity = !defaultPolarity;
};

export const getAssignment = () => assignment;

export const getDefaultPolaity = () => defaultPolarity;
