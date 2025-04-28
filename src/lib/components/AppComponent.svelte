<script lang="ts">
	import { problemStore, updateVariablePool, type Problem } from '$lib/store/problem.store.ts';
	import {
		dummyAssignmentAlgorithm,
		type DummySearchParams
	} from '$lib/transversal/algorithms/dummy.ts';
	import { manualAssignment, type ManualParams } from '$lib/transversal/algorithms/manual.ts';
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
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { activeTrail, recordStack, redo, undo } from '$lib/store/stack.store.ts';

	let expandPropagations: boolean = $state(false);

	let updateVP: boolean = $state(false);

	let trails: Trail[] = $state([]);

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

	function activateTrail(t: Trail[]) {
		if (t === undefined) return;
		trails = t;
		if (updateVP) {
			updateVP = false;
			updateVariablePool(trails[trails.length - 1]);
		}
	}

	function actionReaction(a: ActionEvent) {
		if (a === undefined) return;
		if (a.type === 'record') {
			recordStack(trails);
		} else if (a.type === 'undo') {
			undo();
			updateVP = true;
		} else if (a.type === 'redo') {
			redo();
			updateVP = true;
		}
	}

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = e.expand;
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) => algorithmStep(e));
		const unsubscribeActiveTrail = activeTrail.subscribe((t: Trail[]) => activateTrail(t));
		const unsubscribeActionEvent = actionEvent.subscribe((a: ActionEvent) => actionReaction(a));
		return () => {
			unsubscribeToggleEditor();
			unsubscribeAssignment();
			unsubscribeActiveTrail();
			unsubscribeActionEvent();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
