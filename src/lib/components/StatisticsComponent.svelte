<script lang="ts">
	import { getProblemStore, type Problem } from '$lib/store/problem.svelte.ts';
	import { getSolverMachine } from '$lib/store/stateMachine.svelte.ts';
	import {
		getClausesLeft,
		getNoConflicts,
		getNoDecisions,
		getNoUnitPropagations,
		type ClauseCountEntry
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
		const collection: ClauseCountEntry = getClausesLeft();
		let minimum: number | undefined = undefined;
		for (let i = 0; i < getTrails().length; i++) {
			if (
				(collection[i] !== undefined && minimum === undefined) ||
				(minimum !== undefined && collection[i] < minimum)
			)
				minimum = collection[i];
		}
		return minimum;
	});
	const finished: boolean = $derived(getSolverMachine().onFinalState());
	const unsat: boolean = $derived(getSolverMachine().onUnsatState());
</script>

<div class="h-full space-y-5 border-t border-[var(--border-color)]">
	<div class="flex place-content-around pt-3">
		<div class="metric">
			Decision Level:
			<span class="statistic-value">{decisionLevelCurrentTrail}</span>
		</div>
		{#if !finished}
			<div class="metric">
				Clauses left:
				<span class="statistic-value">{clausesLeft}</span>
			</div>
		{/if}
		{#if unsat}
			<div class="metric">
				Minimum Clauses:
				<span class="statistic-value">{minimumClausesLeft}</span>
			</div>
		{/if}
	</div>
	<div class="flex place-content-around">
		<div class="metric">
			<span>Decisions:</span>
			<span class="statistic-value">{decisions}</span>
		</div>
		<div class="metric">
			<span>Conflicts:</span>
			<span class="statistic-value">{conflicts}</span>
		</div>
		<div class="metric">
			<span>Unit propagations:</span>
			<span class="statistic-value">{unitPropagations}</span>
		</div>
	</div>
</div>

<style>
	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1px 5px;
		flex: 1;
		min-width: 5rem;
		max-width: 12rem;
		background-color: white;
		border-radius: 5px;
		border: 1px solid var(--border-color);
	}
	.statistic-value {
		text-align: right;
	}
</style>
