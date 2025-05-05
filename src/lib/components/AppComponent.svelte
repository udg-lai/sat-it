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
	import { isUnsat, makeUnsat, type Eval } from '$lib/transversal/utils/interfaces/IClausePool.ts';
	import type {
		Algorithm,
		StepParams,
		StepResult
	} from '$lib/transversal/utils/types/algorithms.ts';
	import { isUnitClause, isUnsatClause } from '$lib/transversal/entities/Clause.ts';
	import type ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
	import type VariablePool from '$lib/transversal/entities/VariablePool.svelte.ts';
	import {
		checkAndUpdatePointer,
		getClausesToCheck,
		getPreviousEval,
		resetWorkingTrailPointer,
		updateFinished,
		updatePreviousEval,
		updateStarted,
		updateWorkingTrailPointer
	} from '$lib/store/clausesToCheck.svelte.ts';

	let expandPropagations: boolean = $state(true);

	let trails: Trail[] = $state(getSnapshot().snapshot);

	let previousEval: Eval = $derived(getPreviousEval());

	// Variables to take care of unit propagition
	let clausesToCheck: Set<number> = $derived(getClausesToCheck());

	function preprocesStep(p: PreprocesEvent) {
		if (p === undefined) return;
		const { clauses, algorithm }: Problem = get(problemStore);
		if (p.type === 'start') {
			updateStarted(true);
			const preprocesReturn = algorithm.preprocessing.conflictDetection({ clauses });
			updatePreviousEval(preprocesReturn.evaluation);
			if (!isUnsat(previousEval) && algorithm.preprocessing.unitClauses) {
				const preprocesReturn = algorithm.preprocessing.unitClauses({ clauses });
				updateWorkingTrailPointer(trails, preprocesReturn.clausesToCheck);
			} else if (isUnsat(previousEval)) {
				updateFinished(true);
			}
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
		updateWorkingTrailPointer(trails, returnValues.clausesToCheck);
	}

	function unitPropagationStep(e: UPEvent) {
		if (e === undefined) return;
		const { variables, clauses, algorithm }: Problem = get(problemStore);
		if (e.type === 'step') {
			up(variables, clauses, algorithm);
			if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, trails);
		} else if (e.type === 'following') {
			while (clausesToCheck.size > 0) {
				up(variables, clauses, algorithm);
			}
			if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, trails);
		} else if (e.type === 'finish') {
			while (!checkAndUpdatePointer(variables, trails)) {
				while (clausesToCheck.size > 0) {
					up(variables, clauses, algorithm);
				}
				if (clausesToCheck.size === 0) checkAndUpdatePointer(variables, trails);
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
			console.log("Variable pool state",variables.assignedVariables());
			console.log("Clause ID that has been checked", clauseId);
			console.log("Clause that has been checked", clause);
			console.log("Current state of clauses to check", clausesToCheck);
			console.log("Evaluation:",evaluation.evaluation);
			if (isUnitClause(evaluation.evaluation) && algorithm.UPstep !== undefined) {
				const literalToPropagate = evaluation.evaluation.literal;
				const upResult = algorithm.UPstep({ variables, trails, literalToPropagate });
				trails = upResult.trails;
				console.log("Propagated literal",literalToPropagate);
				console.log("Current trail state", trails[trails.length-1])
			} else if (isUnsatClause(evaluation.evaluation)) {
				updatePreviousEval(makeUnsat(clauseId));
				if (trails[trails.length - 1].getDecisionLevel() === 0) {
					updateFinished(true);
				}
			}
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
		resetWorkingTrailPointer();
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
