<script lang="ts">
	import { resetWorkingTrailPointer } from '$lib/store/clausesToCheck.svelte.ts';
	import { resetProblem, updateProblemFromTrail } from '$lib/store/problem.store.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/store/stack.svelte.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import {
		changeInstanceEventBus,
		stateMachineEventBus,
		userActionEventBus,
		type ActionEvent,
		type StateMachineEvent
	} from '$lib/transversal/events.ts';
	import { onMount } from 'svelte';
	import { editorViewEventStore, type EditorViewEvent } from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';
	import { getSolverMachine, updateSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import { getTrails, updateTrails } from '$lib/store/trails.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $derived(getTrails());

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	function onActionEvent(a: ActionEvent) {
		if (a === 'record') {
			record(trails, solverMachine.getActiveStateId());
		} else if (a === 'undo') {
			const snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a === 'redo') {
			const snapshot = redo();
			reloadFromSnapshot(snapshot);
		}
	}

	function stateMachineEvent(s: StateMachineEvent) {
		solverMachine.transition(s);
	}

	function reloadFromSnapshot({ snapshot, activeState }: Snapshot): void {
		const len = snapshot.length;
		if (len > 0) {
			const latest = snapshot[len - 1];
			updateProblemFromTrail(latest);
		} else {
			resetProblem();
			resetWorkingTrailPointer();
		}
		updateTrails([...snapshot]);
		updateSolverMachine(activeState);
	}

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = !expandPropagations;
	}

	function reset(): void {
		resetStack();
		const first = undo();
		reloadFromSnapshot(first);
		resetWorkingTrailPointer();
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeActionEvent = userActionEventBus.subscribe(onActionEvent);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(reset);
		const unsubscribeStateMachineEvent = stateMachineEventBus.subscribe(stateMachineEvent);

		return () => {
			unsubscribeToggleEditor();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
			unsubscribeStateMachineEvent();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
