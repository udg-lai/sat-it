import type { Trail } from '$lib/entities/Trail.svelte.ts';
import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
import type { LiteralBreakpoint } from '$lib/states/breakpoints.svelte.ts';
import type { Algorithm } from '$lib/types/algorithm.ts';
import type { Lit } from '$lib/types/types.ts';
import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<string>();

// emit that the problem has been reset
export const resetProblemEventBus = createEventBus<void>();

// open settings and moe event
export const openSettingsViewEventBus = createEventBus<void>();

// close settings settings and more event
export const closeSettingsViewEventBus = createEventBus<void>();

// decision that user can take for the state machine

export type SolverCommand =
	| 'step'
	| 'solve_trail'
	| 'automatic_steps'
	| 'solve_all'
	| 'nextVariable'
	| 'up1'
	| 'finishCD'
	| 'finishCA'
	| 'nextDecision' // propagates until next decision (DECISION not executed)
	| 'branching'; // execute a branching (DECISION executed + propagations)

export const solverCommandEventBus = createEventBus<SolverCommand>();

export type FinishSolverSignal = 'finish-step' | 'finish-step-by-step';
export type BeginSolverSignal = 'begin-step' | 'begin-step-by-step';

export type SolverSignal = FinishSolverSignal | BeginSolverSignal;

// event bus dedicated to the life cycle of the state machine
export const solverSignalEventBus = createEventBus<SolverSignal>();

// observable of algorithm changes
export const changeAlgorithmEventBus = createEventBus<Algorithm>();

// event bus for breakpoints
export const breakpointEvent = createEventBus<LiteralBreakpoint>();

// event bus for trail size changes
export const trailTrackingEventBus = createEventBus<number>();

// event bus for collapse/expand of the trails
export const expandEditorTrailsEventBus = createEventBus<boolean>();

// event bus for opening the conflict detection view
export const conflictDetectionEventBus = createEventBus<void>();

export type UndoToDecisionEvent = {
	decision: VariableAssignment;
	trailID: number; // trail id matches the trail index
};

// event bus for opening the conflict detection view
export const algorithmicUndoEventBus = createEventBus<UndoToDecisionEvent>();

// event bus dedicated to toggle the trail view
// export const toggleTrailViewEventBus = createEventBus<void>();

// event that contains the trails to render (for performance and solver stages reasons)
export const renderTrailsEventBus = createEventBus<Trail[]>();

// event bus to change the delay of the application.
export const stepDelayEventBus = createEventBus<number>();

// event bus to notify about new decisions made by the algorithms.
export const decisionMadeEventBus = createEventBus<Lit>();

// event bus to notify about a new trail stacked
export const trailStackedEventBus = createEventBus<void>();

// event bus to notify a single undo wants to be done.
export const ctrlZEventBus = createEventBus<void>();
