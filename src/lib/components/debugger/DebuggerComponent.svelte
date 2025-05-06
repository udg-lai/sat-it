<script lang="ts">
	import { getClausesToCheck, getFinished } from '$lib/store/clausesToCheck.svelte.ts';
	import { problemStore } from '$lib/store/problem.store.ts';
	import { slide } from 'svelte/transition';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';
	import ManualDebugger from './ManualDebuggerComponent.svelte';
	import PreprocesDebugger from './PreprocesDebuggerComponent.svelte';
	import UnitPropagationDebugger from './UnitPropagationDebuggerComponent.svelte';
	import { onMount } from 'svelte';
	import { changeInstanceEventBus, preprocesSignalEventBus } from '$lib/transversal/events.ts';

	let defaultNextVariable: number | undefined = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
		else return 0;
	});
	let enablePreproces = $state(true);
	const enableUnitPropagtion = $derived(getClausesToCheck().size !== 0);
	const disableButton = $derived(getFinished());

	onMount(() => {
		const unsubscribeChangeInstanceEvent = changeInstanceEventBus.subscribe(
			() => (enablePreproces = true)
		);
		const unsusbscribePreprocesEvent = preprocesSignalEventBus.subscribe(
			() => (enablePreproces = false)
		);
		return () => {
			unsubscribeChangeInstanceEvent();
			unsusbscribePreprocesEvent();
		};
	});
</script>

<div transition:slide|global class="flex-center debugger align-center relative flex-row gap-2">
	<div class="variable-display"></div>
	{#if enablePreproces}
		<PreprocesDebugger />
	{:else if enableUnitPropagtion}
		<UnitPropagationDebugger />
	{:else}
		{#if defaultNextVariable}
			{defaultNextVariable}
		{:else}
			{'X'}
		{/if}
		<BacktrackingDebugger {defaultNextVariable} {disableButton} />

		<ManualDebugger {defaultNextVariable} {disableButton} />

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
