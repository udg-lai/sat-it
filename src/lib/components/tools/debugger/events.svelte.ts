import { writable, type Writable } from 'svelte/store';

type Decide<T> = 'Automated' | T;

export interface DecisionEvent<T> {
	decision: Decide<T>;
}

export const decisionEventStore: Writable<DecisionEvent<number>> = writable();

export const emitDecisionEvent = (decision: Decide<number>) => {
	decisionEventStore.update(() => ({ decision }));
};

export interface EditorViewEvent {
	expand: boolean;
}

export const editorViewEventStore: Writable<EditorViewEvent> = writable();

export const emitEditorViewEvent = (state: boolean) => {
	editorViewEventStore.update(() => ({ expand: state }));
};
