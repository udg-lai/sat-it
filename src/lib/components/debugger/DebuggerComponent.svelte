<script lang="ts">
	import type { SolverMachine } from '$lib/machine/SolverMachine.svelte.ts';
	import type { StateFun, StateInput } from '$lib/machine/StateMachine.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import AutomaticDebugger from './AutomaticDebuggerComponent.svelte';
	import AutoModeComponent from './AutoModeComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerComponent.svelte';
	import InitialStepDebugger from './InitialStepDebuggerComponent.svelte';
	import ManualDebugger from './ManualDebuggerComponent.svelte';
	import ResetProblemDebugger from './ResetProblemDebuggerComponent.svelte';

	let defaultNextVariable: number | undefined = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
		else return 0;
	});

	let solverMachine: SolverMachine<StateFun, StateInput> = $derived(getSolverMachine());
	let enablePreprocess = $derived(solverMachine.onInitialState());
	let enableBacktracking = $derived(solverMachine.onConflictState());
	let enableConflictDetection = $derived(solverMachine.detectingConflict());
	let finished = $derived(solverMachine.completed());
	let inAutoMode = $derived(solverMachine.isInAutoMode());
</script>

<div class="flex-center debugger align-center relative flex-row gap-2">
	{#if inAutoMode}
		<AutoModeComponent />
	{:else}
		<div class="variable-display"></div>

		{#if enablePreprocess}
			<InitialStepDebugger />
		{:else}
			{#if enableConflictDetection}
				<ConflictDetectionDebugger cdMode={enableConflictDetection} />
			{:else if !finished}
				{#if !enableBacktracking && defaultNextVariable}
					{defaultNextVariable}
				{:else}
					{'X'}
				{/if}
				<AutomaticDebugger
					backtrackingState={enableBacktracking}
					{finished}
					cdMode={enableConflictDetection}
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
	{/if}
</div>

<style>
	.debugger {
		width: 100%;
		height: var(--debugger-height);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px;
		border-color: var(--border-color);
		border-style: solid;
	}

	.variable-display {
		width: 8rem;
		text-align: center;
		color: grey;
	}

	:root {
		--debugger-height: 90px;
	}
</style>
