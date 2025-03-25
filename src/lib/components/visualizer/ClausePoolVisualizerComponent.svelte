<script lang="ts">
	import ClausePool from '$lib/transversal/entities/ClausePool.svelte.ts';
	import ClauseVisualizerComponent from '$lib/components/visualizer/ClauseVisualizerComponent.svelte';
	interface Props {
		clausePool: ClausePool;
	}
	let { clausePool }: Props = $props();

	let clauses = $state(clausePool.getClauses());
</script>

<div>
	{#each clauses as c}
		<ClauseVisualizerComponent clause={c} />
	{/each}
</div>
