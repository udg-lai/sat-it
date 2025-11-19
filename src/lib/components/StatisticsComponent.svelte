<script lang="ts">
	import type Problem from '$lib/entities/Problem.svelte.ts';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import { getProblemStore } from '$lib/states/problem.svelte.ts';
	import { getSolverMachine } from '$lib/states/solver-machine.svelte.ts';
	import {
		getClausesLeft,
		getNoConflicts,
		getNoDecisions,
		getNoUnitPropagations,
		type ClauseCountEntry
	} from '$lib/states/statistics.svelte.ts';
	import { getLatestTrail, getTrails } from '$lib/states/trails.svelte.ts';

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
			<span class="statistic-value">{minimumClausesLeft}</span>
		</div>
	{/if}
</statistics>

<style>
	statistics {
		border: none;
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
