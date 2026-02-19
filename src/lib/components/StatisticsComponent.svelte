<script lang="ts">
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import { getClausePool } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import {
		getNoConflicts,
		getNoDecisions,
		getNoUnitPropagations,
		getVisitedClauses
	} from '$lib/states/statistics.svelte.ts';
	import { getLatestTrail } from '$lib/states/trails.svelte.ts';

	const decisions: number = $derived(getNoDecisions());
	const conflicts: number = $derived(getNoConflicts());
	const unitPropagations: number = $derived(getNoUnitPropagations());
	const decisionLevelCurrentTrail: number = $derived.by(() => {
		const latestTrail: Trail | undefined = getLatestTrail();
		if (latestTrail) {
			return latestTrail.getDL();
		} else return 0;
	});
	const clausesLeft: number = $derived(getClausePool().leftToSatisfy());
	const visitedClauses: number = $derived(getVisitedClauses());
	const unsat: boolean = $derived(getSolverMachine().onUnsatState());
</script>

<statistics>
	<div class="metric">
		Decision Level:
		<span class="statistic-value">{decisionLevelCurrentTrail}</span>
	</div>
	<div class="metric">
		<span>Decisions:</span>
		<span class="statistic-value">{decisions}</span>
	</div>
	<div class="metric">
		<span>Conflicts:</span>
		<span class="statistic-value">{conflicts}</span>
	</div>
	<div class="metric">
		<span>UPs:</span>
		<span class="statistic-value">{unitPropagations}</span>
	</div>
	<div class="metric">
		Clauses left:
		<span class="statistic-value">{clausesLeft}</span>
	</div>
	{#if unsat}
		<div class="metric">
			Minimum Clauses:
			<span class="statistic-value">{visitedClauses}</span>
		</div>
	{/if}
</statistics>

<style>
	statistics {
		border: none;
		font-size: var(--TeX-font-size);
		height: 100%;
	}

	.metric {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 1px 5px;
		flex: 1;
		min-width: 5rem;
		max-width: 12rem;
		border: none;
	}

	.statistic-value {
		text-align: right;
	}

	statistics {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}
</style>
