<script lang="ts">
	import { problemStore } from '$lib/store/problem.store.ts';
	import {
		getNoBacktarcking,
		getNoDecisions,
		getNoUnitPropagations
	} from '$lib/store/statistics.svelte.ts';
	import { Progressbar } from 'flowbite-svelte';
	import { sineOut } from 'svelte/easing';

	const decisions: number = $derived(getNoDecisions());
	const backtrackings: number = $derived(getNoBacktarcking());
	const unitPropagations: number = $derived(getNoUnitPropagations());
	const variablesToAssign: number = $derived(
		$problemStore.variables.nonAssignedVariables().length
	);
	const variablesProgress: number = $derived.by(() => {
		const total = $problemStore.variables.nVariables();
		const assigned = total - variablesToAssign; 
		return (assigned / total) * 100;
	});
	const clausesLeft: number = $derived($problemStore.clauses.leftToSatisfy());
	const clausesProgress: number = $derived.by(() => {
		const total = $problemStore.clauses.size();
		const satisfied = total - clausesLeft;
		return (satisfied / total) * 100;
	});
</script>

<div class="h-full space-y-3 border-t">
	<div class="flex place-content-start items-center pt-3">
		<span class="metric-left">Variables left: {variablesToAssign}</span>
		<Progressbar progress={variablesProgress} animate tweenDuration={1500} easing={sineOut} size="h-2" color="green"/>
	</div>
	<div class="flex place-content-start items-center">
		<span class="metric-left">Clauses left: {clausesLeft}</span>
		<Progressbar progress={clausesProgress} animate tweenDuration={1500} easing={sineOut} size="h-2" color="green"/>
	</div>
	<div class="flex place-content-around">
		<span class="metric">Decisions: {decisions}</span>
		<span class="metric">Conflicts: {backtrackings}</span>
		<span class="metric">UPs: {unitPropagations}</span>
	</div>
</div>

<style>
	.metric {
		border-top: 1px;
		flex: 1 1 0;
		text-align: center;
		min-width: 5rem;
		max-width: 12rem;
		min-height: 1rem;
	}

	.metric-left {
		text-align: left;
		min-width: 10rem;
		max-width: 14rem;
	}
</style>