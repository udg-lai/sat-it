<script lang="ts">
	import { algorithmicUndo } from '$lib/algorithmicUndo.svelte.ts';
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import {
		algorithmicUndoEventBus,
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		changeStepDelayEventBus,
		stateMachineEventBus,
		stateMachineLifeCycleEventBus,
		updateTrailsEventBus,
		userActionEventBus,
		type ActionEvent,
		type UndoToDecisionEvent,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent
	} from '$lib/events/events.ts';
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import { DECIDE_STATE_ID } from '$lib/solvers/reserved.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
	import { getActiveInstance, getInstance } from '$lib/states/instances.svelte.ts';
	import { getProblemStore, syncProblemWithInstance } from '$lib/states/problem.svelte.ts';
	import {
		activateSolverMachine,
		getSolverMachine,
		stopSolverMachine,
		updateSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import {
		getStatistics,
		resetStatistics,
		updateStatistics
	} from '$lib/states/statistics.svelte.ts';
	import { logError, logFatal } from '$lib/states/toasts.svelte.ts';
	import { getTrails, updateTrails } from '$lib/states/trails.svelte.ts';
	import { modifyLiteralWidth } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';
	import type { Algorithm } from '$lib/types/algorithm.ts';
	import { getConfiguredAlgorithm } from './settings/engine/state.svelte.ts';
	import type { Lit } from '$lib/types/types.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';

	let trails: Trail[] = $state([]);

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	let updateOnStep = true;

	function onActionEvent(a: ActionEvent) {
		if (a === 'record') {
			record(trails, solverMachine.getActiveStateId(), getStatistics(), solverMachine.getRecord());
		} else if (a === 'undo') {
			const snapshot: Snapshot = undo();
			reloadFromSnapshot(snapshot);
		} else if (a === 'redo') {
			const snapshot: Snapshot = redo();
			reloadFromSnapshot(snapshot);
		}
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
		resetStack();
		reloadFromSnapshot(undo());
	}

	function onAlgorithmChanged(algorithm: Algorithm): void {
		stopSolverMachine();
		activateSolverMachine(algorithm);
		reset();
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
			logError("Algorithm undo", "You can only undo to decisions")
		}

		const decision: Lit = event.decision.toLit();

		// Wipe learnt clauses
		getProblemStore().forgetLearnedClauses();

		// Reset watches

		// Execute each one of the decisions 
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
		// record, undo and redo different states event
		subscriptions.push(userActionEventBus.subscribe(onActionEvent));
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
