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
		type AlgorithmicUndoEvent,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent
	} from '$lib/events/events.ts';
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import { DECIDE_STATE_ID } from '$lib/solvers/reserved.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';
	import { getInstance } from '$lib/states/instances.svelte.ts';
	import { getProblemStore, syncProblemWithInstance } from '$lib/states/problem.svelte.ts';
	import {
		getSolverMachine,
		resetSolverMachine,
		updateSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/states/stack.svelte.ts';
	import {
		getStatistics,
		resetStatistics,
		updateStatistics
	} from '$lib/states/statistics.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import { getTrails, updateTrails } from '$lib/states/trails.svelte.ts';
	import { modifyLiteralWidth } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';

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
		if (s !== 'solve_all' && s !== 'step') {
			updateOnStep = false;
			solverMachine.disableStops();
		}
		await solverMachine.transition(s);
		if (s !== 'solve_all' && s !== 'step') {
			updateOnStep = true;
			solverMachine.updateStopTimeout(getStepDelay());
		}
	}

	function reloadFromSnapshot({ snapshot, activeState, statistics, record }: Snapshot): void {
		updateTrails([...snapshot]);
		updateTrailsEventBus.emit([...getTrails()]);

		const snapshotSize = snapshot.length;
		if (snapshotSize <= 0) {
			logFatal('Reloading snapshot', 'Unexpected empty array of trails');
		} else {
			const latest: Trail = snapshot[snapshotSize - 1];
			getProblemStore().syncWithTrail(latest);
		}
		updateStatistics(statistics);
		updateSolverMachine(activeState, record);
	}

	function reset() {
		// Reset the problem, statistics, stack and reload from an initial empty snapshot.
		resetStatistics();
		resetStack();
		reloadFromSnapshot(undo());
	}

	function onAlgorithmChanged(): void {
		resetSolverMachine();
		reset();
	}

	function onInstanceChanged(instanceName: string): void {
		// Sync the problem with the new instances, meaning we create
		// a new set of variables and clauses from the instance.
		const instance: DimacsInstance = getInstance(instanceName);
		syncProblemWithInstance(instance);
		// We can not keep the breakpoints when the instance is changed
		clearBreakpoints();
		onAlgorithmChanged();
		modifyLiteralWidth(instance.summary.varCount);
		reset();
	}

	function algorithmicUndoSave(a: AlgorithmicUndoEvent): void {
		const latestTrail: Trail = algorithmicUndo(a.objectiveAssignment, a.trailIndex);
		getProblemStore().syncWithTrail(latestTrail);
		updateSolverMachine(DECIDE_STATE_ID, undefined);
		record(trails, solverMachine.getActiveStateId(), getStatistics(), solverMachine.getRecord());
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
