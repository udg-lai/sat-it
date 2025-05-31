<script lang="ts">
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
	import { resetProblem, updateProblemFromTrail } from '$lib/store/problem.svelte.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/store/stack.svelte.ts';
	import { getSolverMachine, updateSolverMachine } from '$lib/store/stateMachine.svelte.ts';
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
	import { editorViewEventStore, type EditorViewEvent } from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';
	import {
		addBreakpoint,
		clearBreakpoints,
		type VariableBreakpoint
	} from '$lib/store/breakpoints.svelte.ts';

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
		const len = snapshot.length;
		if (len > 0) {
			const latest = snapshot[len - 1];
			updateProblemFromTrail(latest);
		} else {
			resetProblem();
		}
		updateTrails([...snapshot]);
		updateStatistics(statistics);
		updateSolverMachine(activeState, record);
	}

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = !expandPropagations;
	}

	function reset(): void {
		resetStack();
		resetStatistics();
		clearBreakpoints();
		const first = undo();
		reloadFromSnapshot(first);
	}

	function fullyReset(): void {
		clearBreakpoints();
		reset();
	}

	const b3: VariableBreakpoint = {
		type: 'variable',
		variableId: 18
	};

	addBreakpoint(b3);

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

<TrailEditor {trails} {expandPropagations} />
