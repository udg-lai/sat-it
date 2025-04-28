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
	expand: boolean;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = (state: boolean) => {
	editorViewEventStore.update(() => ({ expand: state }));
};

type RecordAciton = {
	type: 'record';
};

type UndoAction = {
	type: 'undo';
};

type RedoAction = {
	type: 'redo';
};

export type ActionEvent = RecordAciton | UndoAction | RedoAction;

export const actionEvent: Writable<ActionEvent> = writable();

export const emitActionEvent = (action: ActionEvent) => {
	actionEvent.set({ ...action });
};
