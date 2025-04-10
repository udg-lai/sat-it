<script lang="ts">
	import { onMount } from 'svelte';
	import { emitEditorViewEvent } from './events.svelte.ts';
	import BacktrackingDebugger from './BacktrackingDebuggerComponent.svelte';
	import GeneralDebuggerButtons from './GeneralDebuggerButtonsComponent.svelte';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Expanded' : 'Collapsed');

	onMount(() => {
		emitEditorViewEvent(expanded);
	});

	function toggleExpand() {
		expanded = !expanded;
		emitEditorViewEvent(expanded);
	}
</script>

<div class="flex-center debugger flex-col">
	<button class="btn-expand mb-[1rem]" onclick={toggleExpand}>
		<h1>Toggle - {textCollapse}</h1>
	</button>
	<!-- Here we should have an if deppending on the algorithm view -->
	<BacktrackingDebugger />
	<!-- End Of If -->
	<GeneralDebuggerButtons />
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		display: flex;
	}
</style>
