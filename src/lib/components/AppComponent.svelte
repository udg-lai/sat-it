<script lang="ts">
	import { problemStore, type Problem } from '$lib/store/problem.store.ts';
	import {
		dummyAssignmentAlgorithm,
		type DummySearchParams
	} from '$lib/transversal/algorithms/dummy.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import {
		assignmentEventStore,
		editorViewEventStore,
		type AssignmentEvent,
		type EditorViewEvent
	} from './tools/debugger/events.svelte.ts';
	import TrailEditor from './visualizer/TrailEditorComponent.svelte';
	import { get } from 'svelte/store';
	import {
		updateFollowingVariable
	} from '$lib/store/debugger.store.ts';

	let editorExpanded: boolean = $state(true);

	let trails: Trail[] = $state([]);

	function algorithmStep(e: AssignmentEvent<number>): void {
		if (e === undefined) return;

		const { pools }: Problem = get(problemStore);
		const { variables } = pools;

		const params: DummySearchParams = {
			variables,
			trails
		};

		if (e.assignment === 'Automated') {
			trails = dummyAssignmentAlgorithm(params);
		} else {
			console.log(`User assignment not implemented yet`);
		}
		updateFollowingVariable();
	}

	function toggleEditorView(e: EditorViewEvent) {
		if (e === undefined) return;

		editorExpanded = e.expand;
	}

	function onProblemUpdated(p: Problem): void {
		if (p === undefined) return;
		trails = [];
	}

	onMount(() => {
		const unsubscribeProblem = problemStore.subscribe(onProblemUpdated);
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(toggleEditorView);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) => algorithmStep(e));
		return () => {
			unsubscribeProblem();
			unsubscribeToggleEditor();
			unsubscribeAssignment();
		};
	});
</script>

<TrailEditor {trails} {editorExpanded} />
