import { writable, type Writable } from 'svelte/store';

export type ManualAssignment = {
	type: 'manual';
	variable: number;
	polarity: boolean;
};

type AutomatedAssignment = {
	type: 'automated';
};

export type AssignmentEvent = AutomatedAssignment | ManualAssignment;

export const assignmentEventStore: Writable<AssignmentEvent> = writable();

export const emitAssignmentEvent = (assignment: AssignmentEvent) => {
	assignmentEventStore.set({ ...assignment });
};

export interface EditorViewEvent {
	expand: undefined;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = () => {
	editorViewEventStore.update(() => ({ expand: undefined }));
};
