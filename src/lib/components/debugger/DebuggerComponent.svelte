<script lang="ts">
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import AutomaticDebugger from './AutomaticDebuggerComponent.svelte';
	import AutoModeComponent from './AutoModeComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerComponent.svelte';
	import InitialStepDebugger from './InitialStepDebuggerComponent.svelte';
	import ManualDebugger from './ManualDebuggerComponent.svelte';
	import ResetProblemDebugger from './ResetProblemDebuggerComponent.svelte';

	const problem: Problem = $derived(getProblemStore());
	let defaultNextVariable: number | undefined = $derived(problem.variables.nextVariable());

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
	let enablePreprocess = $derived(solverMachine.onInitialState());
	let enableBacktracking = $derived(solverMachine.onConflictState());
	let enableConflictDetection = $derived(solverMachine.onConflictDetection());
	let finished = $derived(solverMachine.completed());
	let inAutoMode = $derived(solverMachine.isInAutoMode());
</script>

<debugger>
	{#if inAutoMode}
		<AutoModeComponent />
	{:else if enablePreprocess}
		<InitialStepDebugger />
	{:else}
		{#if enableConflictDetection}
			<ConflictDetectionDebugger cdMode={enableConflictDetection} />
		{:else if !finished}
			<AutomaticDebugger
				backtrackingState={enableBacktracking}
				{finished}
				cdMode={enableConflictDetection}
				nextVariable={defaultNextVariable && !enableBacktracking ? defaultNextVariable : undefined}
			/>

			<ManualDebugger
				{defaultNextVariable}
				{finished}
				cdMode={enableConflictDetection}
				backtrackingState={enableBacktracking}
			/>
		{:else}
			<ResetProblemDebugger />
		{/if}

		<GeneralDebuggerButtons {finished} backtrackingState={enableBacktracking} />
	{/if}
</debugger>

<style>
	debugger {
		height: var(--debugger-height);
		width: 50%;
		min-height: var(--debugger-height);
		display: flex;
		align-items: center;
		justify-content: left;
		gap: 0.5rem;
		padding-left: calc(var(--windows-padding) + 15px);
		border-right: 1px solid var(--border-color);
	}

	:root {
		--debugger-height: 90px;
	}
</style>
