<script lang="ts">
	import { emitAssignmentEvent } from './events.svelte.ts';
	import './style.css';
	import { fromJust, isJust } from '$lib/transversal/utils/types/maybe.ts';
	import {
		followingVariable,
		updateFollowingVariable
	} from '$lib/store/debugger.store.ts';
	import { onMount } from 'svelte';

	let algorithms = ['Dummy', 'Backtracking', 'DPLL', 'CDCL'];
	let selectedAlgorithm = $state(algorithms[0]);
	onMount(() => {
		updateFollowingVariable();
	});
</script>

<div class="algorithm-section">
	<span class="algo-txt">Algorithm: </span>
	<select class="algorithm-selector" bind:value={selectedAlgorithm}>
		{#each algorithms as algorithm}
			<option value={algorithm}>{algorithm}</option>
		{/each}
	</select>
</div>
<div class="mb-1 flex-row pack" style="display: flex;">
	{#if isJust($followingVariable)}
		<span class="fixed-text w-[9rem] grow-0">Following variable:</span>
		<span class="var-text grow">{fromJust($followingVariable)}</span>
		<button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
			<h1>Proceed</h1>
		</button>
	{:else}
		<span class="var-text grow">No variables left to assign</span>
		<button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
			<h1>Resolve</h1>
		</button>
	{/if}
</div>
