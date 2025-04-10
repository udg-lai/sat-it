import { writable, type Writable } from 'svelte/store';

export type Manual = {
	variable: number,
	polarity: boolean
}

type Decide<Manual> = 'Automated' | Manual;

export interface AssignmentEvent<Manual> {
	assignment: Decide<Manual>;
}

export const assignmentEventStore: Writable<AssignmentEvent<Manual>> = writable();

export const emitAssignmentEvent = (assignment: Decide<Manual>) => {
	assignmentEventStore.update(() => ({ assignment: assignment }));
};

export interface EditorViewEvent {
	expand: boolean;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = (state: boolean) => {
	editorViewEventStore.update(() => ({ expand: state }));
};
