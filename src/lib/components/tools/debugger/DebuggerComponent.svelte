<script lang="ts">
	import { onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import { Toggle } from 'flowbite-svelte';
	import AutomaticModeComponent from './AutomaticModeComponent.svelte';
	import ManualModecomponent from './ManualModecomponent.svelte';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Expanded' : 'Collapsed');
	let isAutomatic = $state(true);
	let automaticMode = $derived(isAutomatic);

	onMount(() => {
		emitEditorViewEvent(expanded);
	});

	function toggleExpand() {
		expanded = !expanded;
		emitEditorViewEvent(expanded);
	}

	const customSize = 'w-20 h-10 after:left-[4px] after:top-1  after:h-8 after:w-8';
</script>

<div class="flex-center debugger flex-col">
	<button class="btn-expand" onclick={toggleExpand}>
		<h1>Toggle - {textCollapse}</h1>
	</button>
	<div class="mode-section">
		<span class="mode" class:automaticMode={!automaticMode}>Manual</span>
		<Toggle bind:checked={isAutomatic} size="custom" {customSize} color="grey" />
		<span class="mode" class:automaticMode>Automatic</span>
	</div>
	{#if automaticMode}
		<AutomaticModeComponent />
	{:else}
		<ManualModecomponent />
	{/if}

	<!-- <button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
		<h1>Decide</h1>
	</button>

	 -->
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.mode-section {
		display: flex;
		width: 100%;
		height: 5rem;
		justify-content: space-around;
		align-items: center;
		margin-bottom: 10px;
		border-color: var(--border-color);
		border-style: solid;
		border-width: 0 0 2px 0;
	}
	.mode {
		color: rgba(0, 0, 0, 0.3);
		transition: color 0.3s ease;
	}
	.mode.automaticMode {
		color: black;
	}
</style>
