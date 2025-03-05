<script lang="ts">
	import CNF from '$lib/transversal/entities/CNF.svelte.ts';
	import ClauseVisualizerComponent from '$lib/components/visualizer/ClauseVisualizerComponent.svelte';
	interface Props {
		cnf: CNF;
	}
	let { cnf }: Props = $props();

	let clauses = $state(cnf.getClauses());
</script>

<div>
	{#each clauses as c}
		<ClauseVisualizerComponent clause={c} />
	{/each}
</div>
