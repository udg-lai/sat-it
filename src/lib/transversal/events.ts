import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<void>();

// open settings and more event
export const openViewMoreOptionEventBus = createEventBus<void>();

// start the preprocessing of the current problem
export const preprocesSignalEventBus = createEventBus<void>();

// unit propagation user decision
export type UPEvent = 'step' | 'following' | 'finish';
export const unitPropagationEventBus = createEventBus<UPEvent>();

// user action
export type ActionEvent = 'record' | 'undo' | 'redo';
export const userActionEventBus = createEventBus<ActionEvent>();
