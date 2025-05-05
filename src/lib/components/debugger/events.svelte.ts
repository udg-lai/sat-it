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

export type ActionEvent = 'record' | 'undo' | 'redo';

export const actionEvent: Writable<ActionEvent> = writable();

export const emitActionEvent = (action: ActionEvent) => {
	actionEvent.set(action);
};

export type UPEvent = 'step' | 'following' | 'finish';

export const upEvent: Writable<UPEvent> = writable();

export const emitUPEvent = (event: UPEvent) => {
	upEvent.set(event);
};

export type PreprocesEvent = 'start';

export const preprocesEvent: Writable<PreprocesEvent> = writable();

export const emitPreprocesEvent = (event: PreprocesEvent) => {
	preprocesEvent.set(event);
};
