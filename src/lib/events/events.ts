import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { LiteralBreakpoint } from '$lib/states/breakpoints.svelte.ts';
import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<string>();

// open settings and more event
export const openSettingsViewEventBus = createEventBus<void>();

// close settings settings and more event
export const closeSettingsViewEventBus = createEventBus<void>();

// user action
export type ActionEvent = 'record' | 'undo' | 'redo';

export const userActionEventBus = createEventBus<ActionEvent>();

// decision that user can take for the state machine

export type StateMachineEvent =
	| 'step'
	| 'solve_trail'
	| 'solve_all'
	| 'nextVariable'
	| 'finishCD'
	| 'finishCA';

export const stateMachineEventBus = createEventBus<StateMachineEvent>();

// observable of algorithm changes
export const changeAlgorithmEventBus = createEventBus<void>();

// event bus for breakpoints
export const breakpointEvent = createEventBus<LiteralBreakpoint>();

// event bus for trail size changes
export const trailTrackingEventBus = createEventBus<number>();

// event bus for collapse/expand of the trails
export const toggleTrailExpandEventBus = createEventBus<boolean>();

// every time solver started running on automatic it emits an event
export const solverStartedAutoMode = createEventBus<void>();

// every time solver finished running on automatic it emits an event
export const solverFinishedAutoMode = createEventBus<void>();

// event bus for opening the conflict detection view
export const conflictDetectionEventBus = createEventBus<void>();

export type AlgorithmicUndoEvent = {
	objectiveAssignment: VariableAssignment;
	objectiveTrail: Trail;
};

// event bus for opening the conflict detection view
export const algorithmicUndoEventBus = createEventBus<AlgorithmicUndoEvent>();
