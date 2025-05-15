import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<void>();

// open settings and more event
export const openSettingsViewEventBus = createEventBus<void>();

// close settings settings and more event
export const closeSettingsViewEventBus = createEventBus<void>();

// start the preprocessing of the current problem
export const preprocessSignalEventBus = createEventBus<void>();

// unit propagation user decision
export type UPEvent = 'step' | 'following' | 'finish';

export const unitPropagationEventBus = createEventBus<UPEvent>();

// user action
export type ActionEvent = 'record' | 'undo' | 'redo';

export const userActionEventBus = createEventBus<ActionEvent>();

// decision that user can take for the state machine

export type StateMachineEvent = 'step' | 'solve_trail' | 'solve_all';

export const stateMachineEventBus = createEventBus<StateMachineEvent>();
