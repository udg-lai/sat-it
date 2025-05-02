<script lang="ts">
	import { changeInstanceEventBus } from '$lib/store/instances.store.ts';
	import {
		problemStore,
		resetProblem,
		updateProblemFromTrail,
		type Problem
	} from '$lib/store/problem.store.ts';
	import {
		getSnapshot,
		record,
		redo,
		resetStack,
		undo,
		type Snapshot
	} from '$lib/store/stack.svelte.ts';
	import {
		dummyAssignmentAlgorithm,
		type DummySearchParams
	} from '$lib/transversal/algorithms/dummy.ts';
	import { manualAssignment, type ManualParams } from '$lib/transversal/algorithms/manual.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import {
		actionEvent,
		assignmentEventStore,
		editorViewEventStore,
		type ActionEvent,
		type AssignmentEvent,
		type EditorViewEvent
	} from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $state(getSnapshot().snapshot);

	function algorithmStep(e: AssignmentEvent): void {
		if (e === undefined) return;

		const { variables }: Problem = get(problemStore);

		if (e.type === 'automated') {
			const params: DummySearchParams = {
				variables,
				trails
			};
			trails = dummyAssignmentAlgorithm(params);
		} else {
			const params: ManualParams = {
				assignment: e,
				variables,
				trails
			};
			trails = manualAssignment(params);
		}
	}

	function actionReaction(a: ActionEvent) {
		if (a === undefined) return;
		if (a.type === 'record') {
			record(trails);
		} else if (a.type === 'undo') {
			const snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a.type === 'redo') {
			const snapshot = redo();
			reloadFromSnapshot(snapshot);
		}
	}

	function reloadFromSnapshot({ snapshot }: Snapshot): void {
		const len = snapshot.length;
		if (len > 0) {
			const latest = snapshot[len - 1];
			updateProblemFromTrail(latest);
		} else {
			resetProblem();
		}
		trails = [...snapshot];
	}

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = !expandPropagations;
	}

	function reset(): void {
		resetStack();
		const first = undo();
		reloadFromSnapshot(first);
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) => algorithmStep(e));
		const unsubscribeActionEvent = actionEvent.subscribe(actionReaction);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(reset);
		return () => {
			unsubscribeToggleEditor();
			unsubscribeAssignment();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
