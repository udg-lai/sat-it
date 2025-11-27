<script lang="ts">
	import { algorithmicUndo } from '$lib/algorithmicUndo.svelte.ts';
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import {
		algorithmicUndoEventBus,
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		emitChangeStepDelay,
		stateMachineEventBus,
		stateMachineLifeCycleEventBus,
		updateTrailsEventBus,
		userActionEventBus,
		type ActionEvent,
		type AlgorithmicUndoEvent,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent
	} from '$lib/events/events.ts';
	import { DECIDE_STATE_ID } from '$lib/solvers/reserved.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import { getProblemStore } from '$lib/states/problem.svelte.ts';
	import {
		getSolverMachine,
		setSolverStateMachine,
		updateSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import { record, redo, resetStack, undo, type Snapshot } from '$lib/states/stack.svelte.ts';
	import {
		getStatistics,
		resetStatistics,
		updateStatistics
	} from '$lib/states/statistics.svelte.ts';
	import { getTrails, updateTrails } from '$lib/states/trails.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';
	import { getStepDelay } from '$lib/states/delay-ms.svelte.ts';

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
		//First of all the previous delay is saved in case there is a need to update it
		let previousDelay: number | undefined = undefined;
		if (s !== 'automatic_steps' && s !== 'step') {
			previousDelay = getStepDelay();
			updateOnStep = false;
			solverMachine.disableStops();
		}
		await solverMachine.transition(s);
		if (s !== 'automatic_steps' && s !== 'step') {
			if (previousDelay === undefined) {
				logFatal('This is not possible');
			}
			updateOnStep = true;
			solverMachine.updateStopTimeout(previousDelay);
		}
	}

	function reloadFromSnapshot({ snapshot, activeState, statistics, record }: Snapshot): void {
		updateTrails([...snapshot]);
		updateTrailsEventBus.emit(getTrails());

		const snapshotSize = snapshot.length;
		if (snapshotSize <= 0) {
			logFatal('Reloading snapshot', 'Unexpected empty array of trails');
		} else {
			const latest: Trail = snapshot[snapshotSize - 1];
			getProblemStore().updateProblemFromTrail(latest);
		}
		updateStatistics(statistics);
		updateSolverMachine(activeState, record);
	}

	function reset(): void {
		setSolverStateMachine();
		resetStack();
		resetStatistics();
		const first = undo();
		reloadFromSnapshot(first);
	}

	function fullyReset(): void {
		clearBreakpoints();
		reset();
	}

	function algorithmicUndoSave(a: AlgorithmicUndoEvent): void {
		const latestTrail: Trail = algorithmicUndo(a.objectiveAssignment, a.trailIndex);
		getProblemStore().updateProblemFromTrail(latestTrail);
		updateSolverMachine(DECIDE_STATE_ID, undefined);
		record(trails, solverMachine.getActiveStateId(), getStatistics(), solverMachine.getRecord());
	}

	function lifeCycleController(l: StateMachineLifeCycleEvent): void {
		if (
			(l === 'finish-step' &&
				(!solverMachine.isInAutoMode() || (solverMachine.isInAutoMode() && updateOnStep))) ||
			l === 'finish-step-by-step'
		) {
			updateTrailsEventBus.emit(getTrails());
		}
		if ((l === 'finish-step' && !solverMachine.isInAutoMode()) || l === 'finish-step-by-step') {
			userActionEventBus.emit('record');
		}
	}

	onMount(() => {
		const subscriptions: (() => void)[] = [];
		// record, undo and redo different states event
		subscriptions.push(userActionEventBus.subscribe(onActionEvent));
		// transition the state machine event.
		subscriptions.push(stateMachineEventBus.subscribe(stateMachineEvent));
		// reset the machine + breakpoints when an instance is changed.
		subscriptions.push(changeInstanceEventBus.subscribe(fullyReset));
		// rest the machine when the algorithm is changed.
		subscriptions.push(changeAlgorithmEventBus.subscribe(reset));
		// update the problem when an undo is performed.
		subscriptions.push(algorithmicUndoEventBus.subscribe(algorithmicUndoSave));
		// Control what is rendered and what is saved depending on the life cycle of the state machine.
		subscriptions.push(stateMachineLifeCycleEventBus.subscribe(lifeCycleController));
		// update our trails to render them when asked to.
		subscriptions.push(updateTrailsEventBus.subscribe((t) => (trails = [...t])));
		//update machine delay
		subscriptions.push(
			emitChangeStepDelay.subscribe((time) => solverMachine.updateStopTimeout(time))
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
