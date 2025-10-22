import { writable, type Writable } from 'svelte/store';

export interface EditorViewEvent {
	expand: undefined;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = () => {
	editorViewEventStore.update(() => ({ expand: undefined }));
};
