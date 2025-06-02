import type { Breakpoint } from '$lib/store/breakpoints.svelte.ts';
import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<void>();

// open settings and more event
export const openSettingsViewEventBus = createEventBus<void>();

// close settings settings and more event
export const closeSettingsViewEventBus = createEventBus<void>();

// user action
export type ActionEvent = 'record' | 'undo' | 'redo';

export const userActionEventBus = createEventBus<ActionEvent>();

// decision that user can take for the state machine

export type StateMachineEvent = 'step' | 'solve_trail' | 'solve_all' | 'nextVariable' | 'finishUP';

export const stateMachineEventBus = createEventBus<StateMachineEvent>();

// observable of algorithm changes
export const changeAlgorithmEventBus = createEventBus<void>();

// event bus for breakpoints
export const breakpointEvent = createEventBus<Breakpoint>();

// event bus for trail size changes
export const trailTrackingEventBus = createEventBus<number>();
