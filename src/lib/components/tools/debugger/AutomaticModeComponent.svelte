<script lang="ts">
	import { emitAssignmentEvent } from './events.svelte.ts';
	import { problemStore, type Problem } from '$lib/store/problem.store.ts';
	import './style.css';
	import { get } from 'svelte/store';
	import { fromJust, isJust, type Maybe } from '$lib/transversal/utils/types/maybe.ts';
	import { onMount } from 'svelte';

	let algorithms = ['Dummy', 'Backtracking', 'DPLL', 'CDCL'];
	let selectedAlgorithm = $state(algorithms[0]);

	function getFollowingVariable(p: Problem): Maybe<number> {
		const { pools }: Problem = p;
		const { variables } = pools;

		return variables.nextVariableToAssign();
	}

	let problem = $derived(get(problemStore));
	let followingVariable: Maybe<number> = $derived(problem.pools.variables.nextVariableToAssign());

	onMount(() => {
		const unsubscribeFollowingVariable = problemStore.subscribe(getFollowingVariable);
		return () => {
			unsubscribeFollowingVariable();
		};
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

{#if isJust(followingVariable)}
	<div class="flex-row">
		<button class="btn" onclick={() => emitAssignmentEvent('Automated')}>
			<h1>Proceed</h1>
		</button>
		<span>{fromJust(followingVariable)}</span>
	</div>
{:else}
	<button class="btn-fix" onclick={() => emitAssignmentEvent('Automated')}>
		<h1>FIX</h1>
	</button>
{/if}
