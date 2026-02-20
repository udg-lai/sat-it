<script lang="ts">
	import { replay } from '$lib/algorithms/replay.ts';
	import TrailEditor from '$lib/components/trail/TrailEditorComponent.svelte';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { filter } from '$lib/events/createEventBus.ts';
	import {
		algorithmicUndoEventBus,
		changeAlgorithmEventBus,
		changeInstanceEventBus,
		ctrlZEventBus,
		decisionMadeEventBus,
		newTrailStackedEventBus,
		renderTrailsEventBus,
		resetProblemEventBus,
		solverCommandEventBus,
		solverSignalEventBus,
		stepDelayEventBus,
		type SolverCommand,
		type SolverSignal,
		type UndoToDecisionEvent
	} from '$lib/events/events.ts';
	import type { DimacsInstance } from '$lib/instances/dimacs-instance.interface.ts';
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { clearBreakpoints } from '$lib/states/breakpoints.svelte.ts';
	import { getActiveInstance, getInstance } from '$lib/states/instances.svelte.ts';
	import { getConfDelayMS } from '$lib/states/parameters.svelte.ts';
	import { syncProblemWithInstance } from '$lib/states/problem.svelte.ts';
	import {
		activateSolverMachine,
		getSolverMachine,
		stopSolverMachine
	} from '$lib/states/solver-machine.svelte.ts';
	import { increaseNoDecisions, resetStatistics } from '$lib/states/statistics.svelte.ts';
	import { logFatal } from '$lib/states/toasts.svelte.ts';
	import {
		allocDecisionsTrail,
		getDecisions,
		retrieveEarlierDecisions,
		saveDecision,
		wipeDecisions,
		type SavedDecision
	} from '$lib/states/trail-decisions.svelte.ts';
	import { stackDifferPos, wipeDifferSequence } from '$lib/states/trail-differ-sequence.svelte.ts';
	import {
		collapseTrailsContext,
		getLatestTrail,
		getTrails,
		wipeTrails
	} from '$lib/states/trails.svelte.ts';
	import type { Algorithm } from '$lib/types/algorithm.ts';
	import type { List, Lit } from '$lib/types/types.ts';
	import { modifyCRefWidth, modifyLiteralWidth } from '$lib/utils.ts';
	import { onMount } from 'svelte';
	import DebuggerComponent from './debugger/DebuggerComponent.svelte';
	import { getConfiguredAlgorithm } from './settings/engine/state.svelte.ts';
	import SolvingInformationComponent from './SolvingInformationComponent.svelte';

	let trails: Trail[] = $state([]);

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());

	function onDecision(decision: Lit) {
		// The decision is saved in the list
		saveDecision(decision);
		// Then the statistics are updated
		increaseNoDecisions();
	}

	async function solverCommandHandler(s: SolverCommand) {
		if (s !== 'automatic_steps' && s !== 'step') {
			solverMachine.disableStepDelay();
		} else {
			solverMachine.updateStepDelayMS(getConfDelayMS());
		}
		await solverMachine.transitionByEvent(s);
	}

	function solverFinishSignalHandler(signal: SolverSignal): void {
		// This handler only deals with finishing signals,
		// it is important because the solver offers two kind of solving modes:
		// 1. Automatic solving: where the solver runs without stopping until a solution or conflict is found.
		// 2. Transitioning to certain points: where the solver stops at certain points to allow user interaction.
		// Option 1 requires updating the trails at each step, while option 2 only requires updating the trails
		// when the step-by-step finishing signal is received.

		if (signal !== 'finish-step' && signal !== 'finish-step-by-step') {
			logFatal('Solver Signal', `Unsupported solver finish signal: ${signal}`);
		}

		if (solverMachine.runningOnAutomatic()) {
			// Update the trails on each step when running automatically
			renderTrailsEventBus.emit(getTrails());
		} else {
			// If not running on automatic, only update on finish-step-by-step
			if (signal === 'finish-step-by-step') renderTrailsEventBus.emit(getTrails());
			else {
				// For some reason a n+1 trail is created when finishing a step
				// we need to show it
				if (getTrails().length > trails.length) {
					renderTrailsEventBus.emit(getTrails());
				}
			}
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
		// Stops the current solver machine and activate the configured one again.
		stopSolverMachine();
		activateSolverMachine(getConfiguredAlgorithm());

		const instance: DimacsInstance = getInstance(instanceName);
		// We can not keep the breakpoints when the instance is changed
		clearBreakpoints();
		modifyLiteralWidth(instance.summary.varCount);
		modifyCRefWidth(instance.summary.clauseCount);
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
		// Hides the context of all trails
		collapseTrailsContext();
		allocDecisionsTrail();
		stackDifferPos(getLatestTrail().getAssignments().length);
	}

	async function algorithmicUndoSave(event: UndoToDecisionEvent): Promise<void> {
		const varAssignment: VariableAssignment = event.decision;
		if (!varAssignment.isD()) {
			logFatal('Algorithm undo', 'You can only undo to decisions');
		}
		// Get the decisions that will be kept
		const decision: Lit = event.decision.toLit();
		const trailID: number = event.trailID;

		// This are the decisions that will be reapplied
		// As solvers are deterministic, reapplying them will lead to the same state.
		// PSS. It is mandatory to do it before onProblemReset as the the decisions are wiped there.
		const decisions: List<SavedDecision> = retrieveEarlierDecisions(trailID, decision);

		// As solver will automatically do the solving process again,
		// let's reset the problem.
		onProblemReset();

		// Disable step delays, no animation is required, just solve to the state after reapplying decisions.
		solverMachine.disableStepDelay();

		await replay(decisions);
	}

	async function singleUndo(): Promise<void> {
		// This function reverts the last decision made in the latest trail.
		// By replaying all the earlier decisions except the last one

		let decisions: List<SavedDecision> = getDecisions();
		decisions = decisions.slice(0, decisions.length - 1);

		onProblemReset();

		solverMachine.disableStepDelay();

		await replay(decisions);
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
		subs.push(solverCommandEventBus.subscribe(solverCommandHandler));
		// reset the machine + breakpoints when an instance is changed.
		subs.push(changeInstanceEventBus.subscribe(onInstanceChanged));
		// reset the machine when the problem is reset.
		subs.push(resetProblemEventBus.subscribe(onProblemReset));
		// reset the machine when the algorithm is changed.
		subs.push(changeAlgorithmEventBus.subscribe(onAlgorithmChanged));
		// update the problem when an undo is performed.
		subs.push(algorithmicUndoEventBus.subscribe(algorithmicUndoSave));
		// Control what is rendered and what is saved depending on the life cycle of the state machine.
		subs.push(
			solverSignalEventBus
				.pipe(filter((e: SolverSignal) => e === 'finish-step-by-step' || e == 'finish-step'))
				.subscribe(solverFinishSignalHandler)
		);
		// update our trails to render them when asked to.
		subs.push(renderTrailsEventBus.subscribe(updateTrails));
		// update machine delay
		subs.push(stepDelayEventBus.subscribe((delay) => solverMachine.updateStepDelayMS(delay)));
		// record and statistics update done when a decision is made
		subs.push(decisionMadeEventBus.subscribe(onDecision));
		// update the structures when a trail has been pushed.
		subs.push(newTrailStackedEventBus.subscribe(onTrailStacked));
		// undo the last decision that was done
		subs.push(ctrlZEventBus.subscribe(singleUndo));

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
