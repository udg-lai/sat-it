<script lang="ts">
	import { problemStore, type Problem } from '$lib/store/problem.store.ts';
	import { dummyAssignmentAlgorithm, type DummySearchParams } from '$lib/transversal/algorithms/dummy.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import { onMount } from 'svelte';
	import {
		assignmentEventStore,
		editorViewEventStore,
		type AssignmentEvent,
		type EditorViewEvent
	} from './tools/debugger/events.svelte.ts';
	import TrailEditor from './visualizer/TrailEditorComponent.svelte';
	import { get } from 'svelte/store';

	let editorExpanded: boolean = $state(true);

	let trailCollection: TrailCollection = $state(new TrailCollection());
	let currentTrail: Trail = $state(new Trail());

	function algorithmStep(e: AssignmentEvent<number>, trails: TrailCollection, trail: Trail): void {
		if (e === undefined) return;

		const { pools }: Problem = get(problemStore);
		const { variables } = pools;

		const params: DummySearchParams = {
			otherTrails: trails,
			currentTrail: trail,
			variablePool: variables
		};

		if (e.assignment === 'Automated') {
			dummyAssignmentAlgorithm(params);
		} else {
			console.log(`User assignment not implemented yet`);
		}
	}

	function toggleEditorView(e: EditorViewEvent) {
		if (e === undefined) return;

		editorExpanded = e.expand;
	}

	function onProblemUpdated(p: Problem): void {
		if (p === undefined) return;

		const { pools } = p;
		const { variables } = pools;

		trailCollection = new TrailCollection();
		currentTrail = new Trail(variables.nVariables());
	}

	onMount(() => {
		const unsubscribeProblem = problemStore.subscribe(onProblemUpdated);
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(toggleEditorView);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) =>
			algorithmStep(e, trailCollection, currentTrail)
		);
		return () => {
			unsubscribeProblem();
			unsubscribeToggleEditor();
			unsubscribeAssignment();
		};
	});
</script>

<TrailEditor previousTrails={trailCollection} {currentTrail} expanded={editorExpanded} />
