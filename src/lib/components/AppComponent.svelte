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
	import { manualAssignment, type ManualParams } from '$lib/transversal/algorithms/manual.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import {
		actionEvent,
		assignmentEventStore,
		editorViewEventStore,
		preprocesEvent,
		upEvent,
		type ActionEvent,
		type AssignmentEvent,
		type EditorViewEvent,

		type PreprocesEvent,

		type UPEvent

	} from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';
	import { isUnsat, makeUnresolved, type Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
	import type { StepParams, StepResult } from '$lib/transversal/utils/types/algorithms.ts';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $state(getSnapshot().snapshot);
	let workingTrailPointer: number = $state(-1);

	let previousEval: Eval = $state(makeUnresolved());

	//Variables to take care of unit propagition
	let clausesToCheck: Set<number> = $state(new Set<number>());

	let end: boolean = $state(false);

	function algorithmStep(e: AssignmentEvent): void {
		if (e === undefined) return;

		const { variables, mapping, algorithm }: Problem = get(problemStore);

		let returnValues: StepResult;

		if (e.type === 'automated') {
			const params: StepParams = {
				variables,
				mapping,
				trails,
				previousEval
			};
			returnValues = algorithm.step(params);
		} else {
			const params: ManualParams = {
				assignment: e,
				variables,
				trails,
				mapping
			};
			returnValues = manualAssignment(params);
		}
		trails = returnValues.trails;
		updateWorkingTrailPointer();
		clausesToCheck = returnValues.clausesToCheck;
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

	function unitPropagationStep(e: UPEvent) {
		if (e === undefined) return;

		const { variables, clauses, algorithm }: Problem = get(problemStore);

		const clausesIterator = clausesToCheck.values().next();

		if(e.type === 'step') {
			const clauseId = clausesIterator.value;
			if(clauseId) {
				const clause = clauses.get(clauseId);
				const evaluation = algorithm.conflictDetection({clause});

				clausesToCheck.delete(clauseId);
			}
			
		}
		else if(e.type === 'following') {

		}
		else if(e.type === 'finish') {

		}
	}

	function preprocesStep(p: PreprocesEvent) {
		if (p === undefined) return;
		const { clauses, algorithm }: Problem = get(problemStore);
		if (p.type === 'start') {
			const preprocesReturn = algorithm.preprocessing.conflictDetection({clauses});
			previousEval = preprocesReturn.evaluation;
			if(!isUnsat(previousEval) && algorithm.preprocessing.unitClauses) {
				const preprocesReturn = algorithm.preprocessing.unitClauses({clauses});
				updateWorkingTrailPointer();
				clausesToCheck = preprocesReturn.clausesToCheck;
			}
			else if(isUnsat(previousEval)) {
				end = true;
			}
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

	function updateWorkingTrailPointer() {
		workingTrailPointer = trails[trails.length-1].getAssignments().length-1;
	}

	function reset(): void {
		resetStack();
		const first = undo();
		reloadFromSnapshot(first);
		workingTrailPointer = -1;
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeAssignment = assignmentEventStore.subscribe((e) => algorithmStep(e));
		const unsubscribeActionEvent = actionEvent.subscribe(actionReaction);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(reset);
		const unsusbscribeUPEvent = upEvent.subscribe((e) => unitPropagationStep(e));
		const unsusbscribePreprocesEvent = preprocesEvent.subscribe((p) => preprocesStep(p));
		return () => {
			unsubscribeToggleEditor();
			unsubscribeAssignment();
			unsubscribeActionEvent();
			unsubscribeChangeInstanceEvent();
			unsusbscribeUPEvent();
			unsusbscribePreprocesEvent();
		};
	});
</script>

<TrailEditor {trails} {expandPropagations} />
