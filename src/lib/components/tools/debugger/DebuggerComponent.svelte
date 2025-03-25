<script lang="ts">
	import { onMount } from 'svelte';
	import { emitDecisionEvent, emitEditorViewEvent } from './events.svelte.ts';

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

<div class="flex-center debugger flex">
	<button class="btn" onclick={() => emitDecisionEvent('Automated')}>
		<h1>Decide</h1>
	</button>

	<button class="btn" onclick={toggleExpand}>
		<h1>Toggle - {textCollapse}</h1>
	</button>
</div>

<style>
	.debugger {
		width: 100%;
		height: 100%;
		background-color: antiquewhite;
		display: flex;
		justify-content: space-around;
	}

	.btn {
		background-color: aqua;
		width: 10rem;
		height: 10rem;
	}
</style>
