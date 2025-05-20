<script lang="ts">
	import { getClausesToCheck } from '$lib/store/clausesToCheck.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import AutomaticDebugger from './AutomaticDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerComponent.svelte';
	import ManualDebugger from './ManualDebuggerComponent.svelte';
	import InitialStepDebugger from './InitialStepDebuggerComponent.svelte';
	import ConflictDetectionDebugger from './ConflictDetectionDebuggerComponent.svelte';
	import ResetProblemDebugger from './ResetProblemDebuggerComponent.svelte';
	import { SAT_STATE_ID, UNSAT_STATE_ID } from '$lib/machine/reserved.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';

	let defaultNextVariable: number | undefined = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
		else return 0;
	});

	const solverMachine = $derived(getSolverMachine());
	const activeId: number = $derived(solverMachine.getActiveStateId());
	const enablePreproces = $derived(activeId === solverMachine.getFirstStateId());
	const backtrackingState = $derived(activeId === solverMachine.getBacktrackingStateId());
	const cdMode = $derived(getClausesToCheck().size !== 0);
	const finished = $derived(activeId === UNSAT_STATE_ID || activeId === SAT_STATE_ID);
</script>

<div class="flex-center debugger align-center relative flex-row gap-2">
	<div class="variable-display"></div>
	{#if enablePreproces}
		<InitialStepDebugger />
	{:else}
		{#if cdMode}
			<ConflictDetectionDebugger {cdMode} />
		{:else if !finished}
			{#if !backtrackingState && defaultNextVariable}
				{defaultNextVariable}
			{:else}
				{'X'}
			{/if}
			<AutomaticDebugger {backtrackingState} {finished} {cdMode} />

			<ManualDebugger {defaultNextVariable} {finished} {cdMode} {backtrackingState} />
		{:else}
			<ResetProblemDebugger />
		{/if}

		<GeneralDebuggerButtons {finished} {backtrackingState} />
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
