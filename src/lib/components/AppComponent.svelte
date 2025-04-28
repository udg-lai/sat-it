<script lang="ts">
	import { problemStore, type Problem } from '$lib/store/problem.store.ts';
	import {
		dummyAssignmentAlgorithm,
		type DummySearchParams
	} from '$lib/transversal/algorithms/dummy.ts';
	import { manualAssignment, type ManualParams } from '$lib/transversal/algorithms/manual.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import {
		assignmentEventStore,
		editorViewEventStore,
		type AssignmentEvent,
		type EditorViewEvent
	} from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';

	let expandPropagations: boolean = $state(false);

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

	function togglePropagations(e: EditorViewEvent) {
		if (e === undefined) return;
		expandPropagations = e.expand;
	}

	function onProblemUpdated(p: Problem): void {
		if (p === undefined) return;
		trails = [];
	}

	onMount(() => {
		const unsubscribeProblem = problemStore.subscribe(onProblemUpdated);
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) => algorithmStep(e));
		return () => {
			unsubscribeProblem();
			unsubscribeToggleEditor();
			unsubscribeAssignment();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
