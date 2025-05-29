<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import {
		getNoConflicts,
		getNoDecisions,
		getNoUnitPropagations
	} from '$lib/store/statistics.svelte.ts';
	import { getLatestTrail, getTrails } from '$lib/store/trails.svelte.ts';
	import type { Trail } from '$lib/transversal/entities/Trail.svelte.ts';

	const problem: Problem = $derived(getProblemStore());
	const decisions: number = $derived(getNoDecisions());
	const conflicts: number = $derived(getNoConflicts());
	const unitPropagations: number = $derived(getNoUnitPropagations());
	const decisionLevelCurrentTrail: number = $derived.by(() => {
		const latestTrail: Trail | undefined = getLatestTrail();
		if (latestTrail) {
			return latestTrail.getDecisionLevel();
		} else return 0;
	});
	const clausesLeft: number = $derived(problem.clauses.leftToSatisfy());
	const minimumClausesLeft: number | undefined = $derived.by(() => {
		const trails: Trail[] = getTrails();
		let minimum: number | undefined = undefined;
		trails.forEach((trail) => {
			if (minimum === undefined || trail.getClausesLeft() < minimum)
				minimum = trail.getClausesLeft();
		});
		return minimum;
	});
	const finished: boolean = $derived(getSolverMachine().onFinalState());
	const unsat: boolean = $derived(getSolverMachine().onUnsatState());
</script>

<div class="h-full space-y-5 border-t">
	<div class="flex place-content-around pt-3">
		<span class="metric">Decision Level: {decisionLevelCurrentTrail}</span>
		{#if !finished}
			<span class="metric">Clauses left: {clausesLeft}</span>
		{/if}
		{#if unsat}
			<span class="metric">Minimum Clauses: {minimumClausesLeft}</span>
		{/if}
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
