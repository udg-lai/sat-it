<script lang="ts">
	import type { SolverMachine } from '$lib/solvers/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/solvers/StateMachine.svelte.ts';
	import { getBaselinePolarity } from '$lib/states/parameters.svelte.ts';
	import { getProblemStore, type Problem } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import AutoModeComponent from './AutoModeComponent.svelte';
	import ConflictAnalysisDebugger from './ConflictAnalysisDebuggerComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import DecisionDebugger from './DecisionDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerComponent.svelte';
	import InitialStepDebugger from './InitialStepDebuggerComponent.svelte';

	const problem: Problem = $derived(getProblemStore());
	let defaultNextVariable: number | undefined = $derived(problem.variables.nextVariable());

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
	let enablePreprocess = $derived(solverMachine.onInitialState());
	let onConflictDetection = $derived(solverMachine.onConflictDetection());
	let onConflict = $derived(solverMachine.onConflictState());
	let finished = $derived(solverMachine.completed());
	let inAutoMode = $derived(solverMachine.isInAutoMode());
</script>

<debugger>
	{#if inAutoMode}
		<AutoModeComponent />
	{:else if enablePreprocess}
		<InitialStepDebugger />
	{:else}
		{#if onConflictDetection}
			<ConflictDetectionDebugger />
		{:else if onConflict && problem.algorithm === 'cdcl'}
			<ConflictAnalysisDebugger />
		{:else if !finished}
			<DecisionDebugger
				{onConflict}
				{finished}
				{onConflictDetection}
				nextLiteral={defaultNextVariable !== undefined && !onConflict
					? getBaselinePolarity() === true
						? defaultNextVariable
						: -defaultNextVariable
					: undefined}
			/>
		{/if}

		<GeneralDebuggerButtons {finished} backtrackingState={onConflict} />
	{/if}
</debugger>

<style>
	debugger {
		height: var(--debugger-height);
		width: 100%;
		min-height: var(--debugger-height);
		display: flex;
		align-items: center;
		justify-content: left;
		gap: 0.5rem;
		padding-left: calc(var(--windows-padding) + 15px);
		border-bottom: 1px solid var(--border-color);
	}
</style>
