<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import {
		getNoBacktarcking,
		getNoDecisions,
		getNoUnitPropagations
	} from '$lib/store/statistics.svelte.ts';
	import { get } from 'svelte/store';

	const decisions: number = $derived(getNoDecisions());
	const backtrackings: number = $derived(getNoBacktarcking());
	const unitPropagations: number = $derived(getNoUnitPropagations());
	const variablesToAssign: number = $derived(
		get(problemStore).variables.nonAssignedVariables().length
	);
	const clausesLeft: number = $derived(get(problemStore).clauses.leftToSatisfy());
</script>

<div class="h-full space-y-5 border-t">
	<div class="flex place-content-around pt-3">
		<span class="metric">Variables left: {variablesToAssign}</span>
		<span class="metric">Clauses left: {clausesLeft}</span>
	</div>
	<div class="flex place-content-around">
		<span class="metric">Decisions: {decisions}</span>
		<span class="metric">Backtrackings: {backtrackings}</span>
		<span class="metric">Unit propagations: {unitPropagations}</span>
	</div>
</div>

<style>
	.metric {
		border-top: 1px;
		flex: 1 1 0;
		text-align: center;
		min-width: 5rem; /* Adjust as needed for consistency */
		max-width: 12rem;
		min-height: 1rem;
	}
</style>
