<script lang="ts">
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
		assignmentEventStore,
		editorViewEventStore,
		type AssignmentEvent,
		type EditorViewEvent
	} from './debugger/events.svelte.ts';
	import TrailEditor from './TrailEditorComponent.svelte';
	import { isSat, isUnsat, makeUnsat, type Eval } from '$lib/transversal/interfaces/IClausePool.ts';
	import type {
		Algorithm,
		StepParams,
		StepResult
	} from '$lib/transversal/utils/types/algorithms.ts';
	import { isUnitClause, isUnsatClause } from '$lib/transversal/entities/Clause.ts';
	import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
	import VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
	import {
		checkAndUpdatePointer,
		getClausesToCheck,
		getPreviousEval,
		resetWorkingTrailPointer,
		updateFinished,
		updatePreviousEval,
		updateWorkingTrailPointer
	} from '$lib/store/clausesToCheck.svelte.ts';
	import {
		changeInstanceEventBus,
		preprocesSignalEventBus,
		unitPropagationEventBus,
		userActionEventBus,
		type ActionEvent,
		type UPEvent
	} from '$lib/transversal/events.ts';
	import type { SvelteSet } from 'svelte/reactivity';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $state(getSnapshot().snapshot);

	let workingTrail: Trail | undefined = $derived(trails[trails.length - 1]);

	let previousEval: Eval = $derived(getPreviousEval());

	let finished: boolean = $derived.by(() => {
		if (!workingTrail) return false;
		const { variables, clauses } = get(problemStore);
		const evaluation = clauses.eval();
		return (
			(isSat(evaluation) && variables.allAssigned()) ||
			(isUnsat(evaluation) && workingTrail.getDecisionLevel() === 0)
		);
	});
	$effect(() => {
		updateFinished(finished);
	});

	// Variables to take care of unit propagition
	let clausesToCheck: SvelteSet<number> = $derived(getClausesToCheck());

	function preprocesStep() {
		const { clauses, algorithm }: Problem = get(problemStore);

		const preprocesReturn = algorithm.preprocessing.conflictDetection({ clauses });
		updatePreviousEval(preprocesReturn.evaluation);
		if (!isUnsat(previousEval) && algorithm.preprocessing.unitClauses) {
			const preprocesReturn = algorithm.preprocessing.unitClauses({ clauses });
			updateWorkingTrailPointer(workingTrail, preprocesReturn.clausesToCheck);
		}
	}

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
		updateWorkingTrailPointer(workingTrail, returnValues.clausesToCheck);
	}

	function unitPropagationStep(e: UPEvent) {
		const { variables, clauses, algorithm }: Problem = get(problemStore);
		if (e === 'step') {
			up(variables, clauses, algorithm);
			if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, workingTrail as Trail);
		} else if (e === 'following') {
			while (clausesToCheck.size > 0) {
				up(variables, clauses, algorithm);
			}
			if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, workingTrail as Trail);
		} else if (e === 'finish') {
			while (!checkAndUpdatePointer(variables, workingTrail as Trail)) {
				console.log('Hola');
				while (clausesToCheck.size > 0) {
					up(variables, clauses, algorithm);
				}
				if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, workingTrail as Trail);
			}
		}
	}

	function up(variables: VariablePool, clauses: ClausePool, algorithm: Algorithm) {
		const clausesIterator = clausesToCheck.values().next();
		const clauseId = clausesIterator.value;
		if (clauseId) {
			const clause = clauses.get(clauseId);
			const evaluation = algorithm.conflictDetection({ clause });
			clausesToCheck.delete(clauseId);
			if (isUnitClause(evaluation.evaluation) && algorithm.UPstep !== undefined) {
				const literalToPropagate = evaluation.evaluation.literal;
				const upResult = algorithm.UPstep({ variables, trails, literalToPropagate, clauseId });
				trails = upResult.trails;
			} else if (isUnsatClause(evaluation.evaluation)) {
				updatePreviousEval(makeUnsat(clauseId));
			}
		}
	}

	function actionReaction(a: ActionEvent) {
		if (a === 'record') {
			record(trails);
		} else if (a === 'undo') {
			const snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a === 'redo') {
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
		resetWorkingTrailPointer();
	}

	onMount(() => {
		const unsubscribeToggleEditor = editorViewEventStore.subscribe(togglePropagations);
		const unsubscribeAssignment = assignmentEventStore.subscribe(algorithmStep);
		const unsubscribeActionEvent = userActionEventBus.subscribe(actionReaction);
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(reset);
		const unsusbscribeUPEvent = unitPropagationEventBus.subscribe(unitPropagationStep);
		const unsusbscribePreprocesEvent = preprocesSignalEventBus.subscribe(preprocesStep);
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
