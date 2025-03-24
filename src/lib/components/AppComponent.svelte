<script lang="ts">
	import { problemStore, type Problem } from '$lib/store/problem.store.ts';
	import { dummySearch, type DummySearchParams } from '$lib/transversal/algorithms/decision.ts';
	import { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { TrailCollection } from '$lib/transversal/entities/TrailCollection.svelte.ts';
	import { onMount } from 'svelte';
	import {
		decisionEventStore,
		editorViewEventStore,
		type DecisionEvent,
		type EditorViewEvent
	} from './tools/debugger/events.svelte.ts';
	import TrailEditor from './visualizer/TrailEditorComponent.svelte';
	import { get } from 'svelte/store';

	let editorExpanded: boolean = $state(true);

	let trailCollection: TrailCollection = $state(new TrailCollection());
	let currentTrail: Trail = $state(new Trail(0));

	function algorithmStep(e: DecisionEvent<number>, trails: TrailCollection, trail: Trail): void {
		if (e === undefined) return;

		const { pools }: Problem = get(problemStore);
		const { variables } = pools;

		const params: DummySearchParams = {
			otherTrails: trails,
			currentTrail: trail,
			variablePool: variables
		};

		if (e.decision === 'Automated') {
			dummySearch(params);
		} else {
			console.log(`User decision not implemented yet`);
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
		const unsubscribeDecision = decisionEventStore.subscribe((e) =>
			algorithmStep(e, trailCollection, currentTrail)
		);
		return () => {
			unsubscribeProblem();
			unsubscribeToggleEditor();
			unsubscribeDecision();
		};
	});
</script>

<TrailEditor previousTrails={trailCollection} {currentTrail} expanded={editorExpanded} />
