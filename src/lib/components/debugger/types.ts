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
