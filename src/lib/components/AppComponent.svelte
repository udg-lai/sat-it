<script lang="ts">
	import {
		finsihed,
		problemStore,
		type AlgorithmParams,
		type AlgorithmReturn,
		type Problem
	} from '$lib/store/problem.store.ts';
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
	import { previousEval, updateEval } from '$lib/store/previousEval.store.ts';

	let showOnlyLastTrail: boolean = $state(false);

	let trails: Trail[] = $state([]);
	

	function algorithmStep(e: AssignmentEvent): void {
		if (e === undefined) return;

		const { variables, clauses, mapping, algorithm }: Problem = get(problemStore);

		if (e.type === 'automated') {
			const params: AlgorithmParams = {
				variables,
				clauses,
				mapping,
				trails,
				previousEval:$previousEval
			};

			const algorithmResult: AlgorithmReturn = algorithm.step(params);
			updateEval(algorithmResult.type);
			trails = algorithmResult.trails;
			finsihed.update(() => {
				return algorithmResult.end;
			});
		} else {
			const params: ManualParams = {
				assignment: e,
				variables,
				trails
			};
			trails = manualAssignment(params);
		}
	}

	function toggleEditorView(e: EditorViewEvent) {
		if (e === undefined) return;

		showOnlyLastTrail = !e.expand;
	}

	function onProblemUpdated(p: Problem): void {
		if (p === undefined) return;
		trails = [];
		updateEval(p.clauses.eval());
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

<TrailEditor {trails} showOnlyLast={showOnlyLastTrail} />
