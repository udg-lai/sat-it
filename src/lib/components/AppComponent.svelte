<script lang="ts">
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/store/breakpoints.svelte.ts';
	import { resetProblem, updateProblemFromTrail } from '$lib/store/problem.svelte.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/store/stack.svelte.ts';
	import {
		getSolverMachine,
		setSolverStateMachine,
		updateSolverMachine
	} from '$lib/store/stateMachine.svelte.ts';
	import {
		getStatistics,
		resetStatistics,
		updateStatistics
	} from '$lib/store/statistics.svelte.ts';
	import { getTrails, updateTrails } from '$lib/store/trails.svelte.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import {
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		stateMachineEventBus,
		userActionEventBus,
		type ActionEvent,
		type StateMachineEvent
	} from '$lib/transversal/events.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import { editorViewEventStore, type EditorViewEvent } from './debugger/events.svelte.ts';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';

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

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeActionEvent = userActionEventBus.subscribe(onActionEvent);
		const unsubscribeStateMachineEvent = stateMachineEventBus.subscribe(stateMachineEvent);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(fullyReset);
		const unsubscribeChangeAlgorithmEvent = changeAlgorithmEventBus.subscribe(reset);

		return () => {
			unsubscribeToggleEditor();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
			unsubscribeStateMachineEvent();
			unsubscribeChangeAlgorithmEvent();
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
