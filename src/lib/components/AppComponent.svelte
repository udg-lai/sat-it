<script lang="ts">
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import {
		algorithmicUndoEventBus,
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		stateMachineEventBus,
		stateMachineLifeCycleEventBus,
		userActionEventBus,
		type ActionEvent,
		type AlgorithmicUndoEvent,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent
	} from '$lib/events/events.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import { resetProblem, updateProblemFromTrail } from '$lib/states/problem.svelte.ts';
	import {
		getSolverMachine,
		setSolverStateMachine,
		updateSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/states/stack.svelte.ts';
	import {
		getStatistics,
		resetStatistics,
		updateStatistics
	} from '$lib/states/statistics.svelte.ts';
	import { getTrails, updateTrails } from '$lib/states/trails.svelte.ts';
	import { onMount } from 'svelte';
	import { editorViewEventStore, type EditorViewEvent } from '../stores/debugger.svelte.ts';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';
	import { algorithmicUndo } from '$lib/algorithmicUndo.svelte.ts';
	import { DECIDE_STATE_ID } from '$lib/solvers/reserved.ts';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $derived(getTrails());

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	function onActionEvent(a: ActionEvent) {
		if (a === 'record') {
			record(trails, solverMachine.getActiveStateId(), getStatistics(), solverMachine.getRecord());
		} else if (a === 'undo') {
			const snapshot: Snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a === 'redo') {
			const snapshot: Snapshot = redo();
			reloadFromSnapshot(snapshot);
		}
	}

	async function stateMachineEvent(s: StateMachineEvent) {
		await solverMachine.transition(s);
	}

	function reloadFromSnapshot({ snapshot, activeState, statistics, record }: Snapshot): void {
		updateTrails([...snapshot]);
		updateStatistics(statistics);
		updateSolverMachine(activeState, record);
		const len = snapshot.length;
		if (len > 0) {
			const latest = snapshot[len - 1];
			updateProblemFromTrail(latest);
		} else {
			resetProblem();
		}
	}

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = !expandPropagations;
	}

	function reset(): void {
		setSolverStateMachine();
		resetStack();
		resetStatistics();
		const first = undo();
		reloadFromSnapshot(first);
	}

	function fullyReset(): void {
		clearBreakpoints();
		reset();
	}

	function algorithmicUndoSave(a: AlgorithmicUndoEvent): void {
		const latestTrail: Trail = algorithmicUndo(a.objectiveAssignment, a.trailIndex);
		updateProblemFromTrail(latestTrail);
		updateSolverMachine(DECIDE_STATE_ID, undefined);
		record(trails, solverMachine.getActiveStateId(), getStatistics(), solverMachine.getRecord());
	}

	function lifeCycleController(l: StateMachineLifeCycleEvent): void {
		if (l === 'finish-step' || l === 'finish-step-by-step') {
			userActionEventBus.emit('record');
		}
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeActionEvent = userActionEventBus.subscribe(onActionEvent);
		const unsubscribeStateMachineEvent = stateMachineEventBus.subscribe(stateMachineEvent);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(fullyReset);
		const unsubscribeChangeAlgorithmEvent = changeAlgorithmEventBus.subscribe(reset);
		const unsubscribeAlgorithmicUndoEvent = algorithmicUndoEventBus.subscribe(algorithmicUndoSave);
		const unsubscribeStateMachineLifeCycleEventBus =
			stateMachineLifeCycleEventBus.subscribe(lifeCycleController);

		return () => {
			unsubscribeToggleEditor();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
			unsubscribeStateMachineEvent();
			unsubscribeChangeAlgorithmEvent();
			unsubscribeAlgorithmicUndoEvent();
			unsubscribeStateMachineLifeCycleEventBus();
		};
	});
</script>

<app>
	<DebuggerComponent />
	<TrailEditor {trails} />
	<SolvingInformationComponent />
</app>

<style>
	app {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
