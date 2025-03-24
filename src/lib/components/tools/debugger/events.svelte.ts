import { writable, type Writable } from 'svelte/store';

type Decide<T> = 'Automated' | T;

export interface DecisionEvent<T> {
	decision: Decide<T>;
}

export const decideEvent: Writable<DecisionEvent<number>> = writable();

export const emitDecision = (decision: Decide<number>) => {
	decideEvent.update(() => ({ decision }));
};

export interface ExpandEvent {
	expand: boolean;
}

export const expandedEvent: Writable<ExpandEvent> = writable();

export const emitExpand = (state: boolean) => {
	expandedEvent.update(() => ({ expand: state }));
};
