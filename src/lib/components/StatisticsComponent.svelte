<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import {
		getNoConflicts,
		getNoDecisions,
		getNoUnitPropagations
	} from '$lib/store/statistics.svelte.ts';

	const problem: Problem = $derived(getProblemStore());
	const decisions: number = $derived(getNoDecisions());
	const conflicts: number = $derived(getNoConflicts());
	const unitPropagations: number = $derived(getNoUnitPropagations());
	const variablesToAssign: number = $derived(problem.variables.nonAssignedVariables().length);
	const clausesLeft: number = $derived(problem.clauses.leftToSatisfy());
</script>

<div class="h-full space-y-5 border-t">
	<div class="flex place-content-around pt-3">
		<span class="metric">Variables left: {variablesToAssign}</span>
		<span class="metric">Clauses left: {clausesLeft}</span>
	</div>
	<div class="flex place-content-around">
		<span class="metric">Decisions: {decisions}</span>
		<span class="metric">Conflicts: {conflicts}</span>
		<span class="metric">Unit propagations: {unitPropagations}</span>
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
</style>
