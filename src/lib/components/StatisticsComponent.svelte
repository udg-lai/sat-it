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

<div class="ml-2 mt-4 h-full space-y-2 leading-snug">
	<div class="flex gap-6">
		<span>Variables left: {variablesToAssign}</span>
		<span>Clauses left: {clausesLeft}</span>
	</div>
	<div class="flex gap-6">
		<span>Decisions: {decisions}</span>
		<span>Backtrackings: {backtrackings}</span>
		<span>Unit propagations: {unitPropagations}</span>
	</div>
</div>
