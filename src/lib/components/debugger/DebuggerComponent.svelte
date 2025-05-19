<script lang="ts">
	import { getActiveState, getClausesToCheck } from '$lib/store/clausesToCheck.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { slide } from 'svelte/transition';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';
	import ManualDebugger from './ManualDebuggerComponent.svelte';
	import InitialStepDebugger from './InitialStep.svelte';
	import UnitPropagationDebugger from './UnitPropagationDebuggerComponent.svelte';
	import ResetProblemDebugger from './ResetProblemDebuggerComponent.svelte';
	import { BACKTRACKING_STATE_ID, SAT_STATE_ID, UNSAT_STATE_ID } from '$lib/machine/reserved.ts';

	let defaultNextVariable: number | undefined = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
		else return 0;
	});

	const activeId = $derived(getActiveState());

	const enablePreproces = $derived(activeId === 0);
	const backtrackingState = $derived(activeId === BACKTRACKING_STATE_ID);
	const enableUnitPropagtion = $derived(getClausesToCheck().size !== 0);
	const finished = $derived(activeId === UNSAT_STATE_ID || activeId === SAT_STATE_ID);

	$effect(() => {
		console.log(activeId);
	});
</script>

<div transition:slide|global class="flex-center debugger align-center relative flex-row gap-2">
	<div class="variable-display"></div>
	{#if enablePreproces}
		<InitialStepDebugger />
	{:else if enableUnitPropagtion}
		<UnitPropagationDebugger />
	{:else}
		{#if !finished}
			{#if !backtrackingState && defaultNextVariable}
				{defaultNextVariable}
			{:else}
				{'X'}
			{/if}
			<BacktrackingDebugger {backtrackingState} disableButton={finished} />

			<ManualDebugger {defaultNextVariable} disableButton={finished} />
		{:else}
			<ResetProblemDebugger />
		{/if}
		<GeneralDebuggerButtons />
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
		width: 50px;
		text-align: center;
		color: grey;
	}

	:root {
		--debugger-height: 90px;
	}
</style>
