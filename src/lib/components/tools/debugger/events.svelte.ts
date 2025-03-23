import { writable, type Writable } from 'svelte/store';

type Decide<T> = 'Automated' | T;

interface DecisionEvent<T> {
	decision: Decide<T>;
}

export const decideEvent: Writable<DecisionEvent<number>> = writable();

export const emitDecision = (decision: Decide<number>) => {
	decideEvent.update(() => ({ decision }));
};

interface ExpandEvent {
	expand: boolean;
}

export const expandedEvent: Writable<ExpandEvent> = writable();

export const emitExpand = (expand: boolean) => {
	expandedEvent.update(() => ({ expand }));
};
