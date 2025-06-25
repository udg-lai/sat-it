import { writable, type Writable } from 'svelte/store';
import type { AssignmentEvent } from '../components/debugger/types.ts';

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
