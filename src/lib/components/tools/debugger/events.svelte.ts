import { writable, type Writable } from 'svelte/store';

type Decide<T> = 'Automated' | T;

export interface AssignmentEvent<T> {
	assignment: Decide<T>;
}

export const assignmentEventStore: Writable<AssignmentEvent<number>> = writable();

export const emitAssignmentEvent = (assignment: Decide<number>) => {
	assignmentEventStore.update(() => ({ assignment: assignment }));
};

export interface EditorViewEvent {
	expand: boolean;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = (state: boolean) => {
	editorViewEventStore.update(() => ({ expand: state }));
};
