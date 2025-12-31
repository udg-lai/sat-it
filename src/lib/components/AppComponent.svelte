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
		trailStackedEventBus,
		stateMachineEventBus,
		stateMachineLifeCycleEventBus,
		renderTrailsEventBus,
		userActionEventBus,
		type StateMachineEvent,
		type StateMachineLifeCycleEvent,
		type UndoToDecisionEvent,
		resetProblemEventBus
	} from '$lib/events/events.ts';
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { updateAssignment } from '$lib/states/assignment.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import {
		allocDecisionsTrail,
		undo,
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
	import { stackDifferPos, wipeDifferSequence } from '$lib/states/trail-differ-sequence.svelte.ts';
	import { getLatestTrail, getTrails, wipeTrails } from '$lib/states/trails.svelte.ts';
	import type { Algorithm } from '$lib/types/algorithm.ts';
	import type { List, Lit, Var } from '$lib/types/types.ts';
	import { modifyLiteralWidth } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import { getConfiguredAlgorithm } from './settings/engine/state.svelte.ts';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';
	import Literal from '$lib/entities/Literal.svelte.ts';

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

	function shareReset(dimacsInstance: DimacsInstance | undefined = undefined): void {
		// Reset the problem, statistics, stack and reload from an initial empty snapshot.
		resetStatistics();
		wipeDecisions();
		wipeDifferSequence();
		// Sync the problem with the new instance, meaning we create
		// a new set of variables and clauses from the instance.
		syncProblemWithInstance(dimacsInstance ?? getActiveInstance().getInstance());

		// Drop the current trails
		wipeTrails();
		renderTrailsEventBus.emit(getTrails());
	}

	function onAlgorithmChanged(algorithm: Algorithm): void {
		stopSolverMachine();
		activateSolverMachine(algorithm);
		shareReset();
	}

	function onInstanceChanged(instanceName: string): void {
		const instance: DimacsInstance = getInstance(instanceName);
		// We can not keep the breakpoints when the instance is changed
		clearBreakpoints();
		modifyLiteralWidth(instance.summary.varCount);
		shareReset(instance);
	}

	function onProblemReset(): void {
		// Stops the current solver machine and activate the configured one again.
		stopSolverMachine();
		activateSolverMachine(getConfiguredAlgorithm());

		// Reset the problem with the current instance.
		const instance: DimacsInstance = getInstance(getActiveInstance().getInstanceName());
		shareReset(instance);
	}

	function onTrailStacked() {
		allocDecisionsTrail();
		stackDifferPos(getLatestTrail().getAssignments().length);
	}

	function algorithmicUndoSave(event: UndoToDecisionEvent): void {
		const varAssignment: VariableAssignment = event.decision;
		if (!varAssignment.isD()) {
			logError('Algorithm undo', 'You can only undo to decisions');
		}
		// Get the decisions that will be kept
		const decision: Lit = event.decision.toLit();
		const trailID: number = event.trailID;

		// This are the decisions that will be reapplied
		// As solvers are deterministic, reapplying them will lead to the same state.
		const decisions: List<SavedDecision> = undo(trailID, decision);
		// As solver will automatically do the solving process again,
		// let's reset the problem.
		onProblemReset();

		getSolverMachine().transitionByEvent('nextDecision');
		for (const { decision } of decisions) {
			//a "manual assignment will be performed"
			const polarity: boolean = !Literal.hatted(decision);
			const variable: Var = Literal.var(decision);
			updateAssignment('manual', polarity, variable);
			// Then decisions will be done until the following decision is found.
			getSolverMachine().transitionByEvent('nextDecision');
		}
	}

	function lifeCycleController(l: StateMachineLifeCycleEvent): void {
		const updateAll = () => {
			renderTrailsEventBus.emit(getTrails());
			userActionEventBus.emit('record');
		};

		// If it is a finish-step-by-step then all action should be performed
		if (l === 'finish-step-by-step') {
			updateAll();
		} else if (l === 'finish-step') {
			// Also, all actions should be performed if a single step has been finished and the solver machine is not in auto mode
			if (!solverMachine.runningOnAutomatic()) {
				updateAll();
			} else if (updateOnStep) {
				// Lastly, only trails should be updated if the updateOnStep is activated.
				// 	forceTrailsRenderEventBus.emit(getTrails());
			}
		}
	}

	function updateTrails(xs: Trail[]): void {
		trails = [...xs];
	}

	function init() {
		onInstanceChanged(getActiveInstance().getInstanceName());
		onAlgorithmChanged(getConfiguredAlgorithm());
		updateTrails(getTrails());
	}

	init();

	onMount(() => {
		const subs: (() => void)[] = [];
		// transition the state machine event.
		subs.push(stateMachineEventBus.subscribe(stateMachineEvent));
		// reset the machine + breakpoints when an instance is changed.
		subs.push(changeInstanceEventBus.subscribe(onInstanceChanged));
		// reset the machine when the problem is reset.
		subs.push(resetProblemEventBus.subscribe(onProblemReset));
		// reset the machine when the algorithm is changed.
		subs.push(changeAlgorithmEventBus.subscribe(onAlgorithmChanged));
		// update the problem when an undo is performed.
		subs.push(algorithmicUndoEventBus.subscribe(algorithmicUndoSave));
		// Control what is rendered and what is saved depending on the life cycle of the state machine.
		subs.push(stateMachineLifeCycleEventBus.subscribe(lifeCycleController));
		// update our trails to render them when asked to.
		subs.push(renderTrailsEventBus.subscribe(updateTrails));
		// update machine delay
		subs.push(changeStepDelayEventBus.subscribe((time) => solverMachine.updateStopTimeout(time)));
		// record and statistics update done when a decision is made
		subs.push(decisionMadeEventBus.subscribe(onDecision));
		// update the structures when a trail has been pushed.
		subs.push(trailStackedEventBus.subscribe(onTrailStacked));

		return () => {
			subs.forEach((f) => f());
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
