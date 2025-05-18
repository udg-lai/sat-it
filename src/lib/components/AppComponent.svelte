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
	import {
		getSolverStateMachine,
		updateSolverStateMachine
	} from '$lib/store/stateMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.ts';
	import type { SolverStateMachine } from '$lib/machine/SolverStateMachine.ts';
	import { getTrails, updateTrails } from '$lib/store/trails.svelte.ts';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $derived(getTrails());

	let stateMachine: SolverStateMachine<StateFun, StateInput> = $derived(getSolverStateMachine());

	function onActionEvent(a: ActionEvent) {
		if (a === 'record') {
			record(trails, stateMachine.getActiveStateId());
		} else if (a === 'undo') {
			const snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a === 'redo') {
			const snapshot = redo();
			reloadFromSnapshot(snapshot);
		}
	}

	function stateMachineEvent(s: StateMachineEvent) {
		stateMachine.transition(s);
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
		updateSolverStateMachine(activeState);
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
		const unsubscirbeStateMachineEvent = stateMachineEventBus.subscribe(stateMachineEvent);

		return () => {
			unsubscribeToggleEditor();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
			unsubscirbeStateMachineEvent();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
