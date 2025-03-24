<script lang="ts">
	import { onMount } from 'svelte';
	import { emitDecision, emitExpand } from './events.svelte.ts';

	let expanded = $state(true);
	let textCollapse = $derived(expanded ? 'Expanded' : 'Collapsed');

	onMount(() => {
		emitExpand(expanded);
	});

	function toggleExpand() {
		expanded = !expanded;
		emitExpand(expanded);
	}
</script>

<div class="flex-center debugger flex">
	<button class="btn" onclick={() => emitDecision('Automated')}>
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
