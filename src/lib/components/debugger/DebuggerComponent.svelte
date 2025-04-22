<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';
	import ManualDebuggerComponent from './ManualDebuggerComponent.svelte';

	let defaultNextVariable: number | undefined = $derived.by(() => {
		if ($problemStore !== undefined) return $problemStore.variables.nextVariable;
		else return 0;
	});
</script>

<div class="flex-center debugger align-center flex-row gap-2">
	
	<div class="variable-display">
		{#if defaultNextVariable}
			{defaultNextVariable}
		{:else}
			{"X"}
		{/if}
	</div>

	<BacktrackingDebugger {defaultNextVariable} />

	<ManualDebuggerComponent {defaultNextVariable} />

	<GeneralDebuggerButtons />
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
