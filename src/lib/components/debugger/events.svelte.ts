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

type RecordAction = {
	type: 'record';
};

type UndoAction = {
	type: 'undo';
};

type RedoAction = {
	type: 'redo';
};

export type ActionEvent = RecordAction | UndoAction | RedoAction;

export const actionEvent: Writable<ActionEvent> = writable();

export const emitActionEvent = (action: ActionEvent) => {
	actionEvent.set({ ...action });
};

type UPStep = {
	type: 'step';
};

type UPFollowing = {
	type: 'following';
};

type UPFinish = {
	type: 'finish';
};

export type UPEvent = UPStep | UPFollowing | UPFinish;

export const upEvent: Writable<UPEvent> = writable();

export const emitUPEvent = (event: UPEvent) => {
	upEvent.set({ ...event });
};

type PreprocesCD = {
	type: 'conflict-detection';
};

type PreprocesUC = {
	type: 'unit-clauses';
};

export type PreprocesEvent = PreprocesCD | PreprocesUC;

export const preprocesEvent: Writable<PreprocesEvent> = writable();

export const emitPreprocesEvent = (event: PreprocesEvent) => {
	preprocesEvent.set({ ...event });
};
