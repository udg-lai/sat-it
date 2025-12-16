<script lang="ts">
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import {
		algorithmicUndoEventBus,
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		changeStepDelayEventBus,
		decisionMadeEventBus,
		newTrailPushed,
		stateMachineEventBus,
		stateMachineLifeCycleEventBus,
		updateTrailsEventBus,
		userActionEventBus,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent,
		type UndoToDecisionEvent
	} from '$lib/events/events.ts';
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import {
		addNewTrailDecisionsList,
		undo as keptDecision,
		saveDecision,
		wipeDecisions,
		type SavedDecision
	} from '$lib/states/decisions.svelte.ts';
	import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
	import { getActiveInstance, getInstance } from '$lib/states/instances.svelte.ts';
	import { syncProblemWithInstance } from '$lib/states/problem.svelte.ts';
	import {
		activateSolverMachine,
		getSolverMachine,
		stopSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import { increaseNoDecisions, resetStatistics } from '$lib/states/statistics.svelte.ts';
	import { logError } from '$lib/states/toasts.svelte.ts';
	import { appendDifferTrailPos, wipeDifferTrailPos } from '$lib/states/trail-diff-start.svelte.ts';
	import { getLatestTrail, getTrails } from '$lib/states/trails.svelte.ts';
	import type { Algorithm } from '$lib/types/algorithm.ts';
	import type { List, Lit, Var } from '$lib/types/types.ts';
	import { modifyLiteralWidth } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import { getConfiguredAlgorithm } from './settings/engine/state.svelte.ts';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';

	let trails: Trail[] = $state([]);

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let updateOnStep = true;

	function onDecision(decision: Lit) {
		// The decision is saved in the list
		saveDecision(decision);
		// Then the statistics are updated
		increaseNoDecisions();
	}

	async function stateMachineEvent(s: StateMachineEvent) {
		console.log('State machine event:', s);

		if (s !== 'automatic_steps' && s !== 'step') {
			updateOnStep = false;
			solverMachine.disableStops();
		}
		await solverMachine.transitionByEvent(s);
		if (s !== 'automatic_steps' && s !== 'step') {
			updateOnStep = true;
			solverMachine.updateStopTimeout(getStepDelay());
		}
	}

	function reset() {
		// Reset the problem, statistics, stack and reload from an initial empty snapshot.
		resetStatistics();
		wipeDecisions();
		wipeDifferTrailPos();
		syncProblemWithInstance(getActiveInstance().getInstance());
	}

	function onAlgorithmChanged(algorithm: Algorithm): void {
		stopSolverMachine();
		activateSolverMachine(algorithm);
		reset();
	}

	function onTrailInsertion() {
		addNewTrailDecisionsList();
		appendDifferTrailPos(getLatestTrail().getAssignments().length);
	}

	function onInstanceChanged(instanceName: string): void {
		// Sync the problem with the new instance, meaning we create
		// a new set of variables and clauses from the instance.
		const instance: DimacsInstance = getInstance(instanceName);
		syncProblemWithInstance(instance);
		// We can not keep the breakpoints when the instance is changed
		clearBreakpoints();
		modifyLiteralWidth(instance.summary.varCount);
		reset();
	}

	function algorithmicUndoSave(event: UndoToDecisionEvent): void {
		const varAssignment: VariableAssignment = event.decision;
		if (!varAssignment.isD()) {
			logError('Algorithm undo', 'You can only undo to decisions');
		}
		// Get the decisions that will be kept
		const decision: Lit = event.decision.toLit();
		const trailIndex: number = event.trailIndex;

		const decisions: List<SavedDecision> = keptDecision(trailIndex, decision);
		// As solver will automatically do the solving process again,
		// let's reset the context.
		reset();

		getSolverMachine().transitionByEvent('nextDecision');
		for (const d of decisions) {
			//a "manual assignment will be performed"
			const polarity: boolean = d.decision > 0;
			const variable: Var = Math.abs(d.decision);
			updateAssignment('manual', polarity, variable);
			// Then decisions will be done until the following decision is found.
			getSolverMachine().transitionByEvent('nextDecision');
		}
	}

	function lifeCycleController(l: StateMachineLifeCycleEvent): void {
		const updateAll = () => {
			updateTrailsEventBus.emit(getTrails());
			userActionEventBus.emit('record');
		};

		// If it is a finish-step-by-step then all action should be performed
		if (l === 'finish-step-by-step') {
			updateAll();
		} else if (l === 'finish-step') {
			// Also, all actions should be performed if a single step has been finished and the solver machine is not in auto mode
			if (!solverMachine.isInAutoMode()) {
				updateAll();
			} else if (updateOnStep) {
				// Lastly, only trails should be updated if the updateOnStep is activated.
				updateTrailsEventBus.emit(getTrails());
			}
		}
	}

	function init() {
		onInstanceChanged(getActiveInstance().getInstanceName());
		onAlgorithmChanged(getConfiguredAlgorithm());
	}

	init();

	onMount(() => {
		const subscriptions: (() => void)[] = [];
		// transition the state machine event.
		subscriptions.push(stateMachineEventBus.subscribe(stateMachineEvent));
		// reset the machine + breakpoints when an instance is changed.
		subscriptions.push(changeInstanceEventBus.subscribe(onInstanceChanged));
		// reset the machine when the algorithm is changed.
		subscriptions.push(changeAlgorithmEventBus.subscribe(onAlgorithmChanged));
		// update the problem when an undo is performed.
		subscriptions.push(algorithmicUndoEventBus.subscribe(algorithmicUndoSave));
		// Control what is rendered and what is saved depending on the life cycle of the state machine.
		subscriptions.push(stateMachineLifeCycleEventBus.subscribe(lifeCycleController));
		// update our trails to render them when asked to.
		subscriptions.push(updateTrailsEventBus.subscribe((t) => (trails = [...t])));
		// update machine delay
		subscriptions.push(
			changeStepDelayEventBus.subscribe((time) => solverMachine.updateStopTimeout(time))
		);
		// record and statistics update done when a decision is made
		subscriptions.push(decisionMadeEventBus.subscribe(onDecision));
		// update the structures when a trail has been pushed.
		subscriptions.push(newTrailPushed.subscribe(onTrailInsertion));

		return () => {
			subscriptions.forEach((f) => f());
		};
	});
</script>

<app>
	<DebuggerComponent />
	<TrailEditor {trails} />
	<SolvingInformationComponent />
</app>

<style>
	app {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
