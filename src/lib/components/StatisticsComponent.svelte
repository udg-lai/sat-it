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
	import { changeInstanceEventBus } from '$lib/transversal/events.ts';
	import { onMount } from 'svelte';

	let activeInstance: string = $state('');
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

	const updateActiveInstance = (name: string) => {
		activeInstance = name;
	};

	onMount(() => {
		const unsuscribeInstanceStore = changeInstanceEventBus.subscribe(updateActiveInstance);

		return () => {
			unsuscribeInstanceStore();
		};
	});
</script>

<div class="h-full space-y-5 pt-2">
	<div class="flex place-content-around">
		<div class="text">
			<span class="text-right">{problem.algorithm}</span>
			{#if activeInstance}
				<span class="text-left">{activeInstance}</span>
			{/if}
		</div>
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
	.text {
		display: flex;
		flex-wrap: wrap;
		flex: 1;
		min-width: 10rem;
		max-width: 17rem;
		justify-content: space-around;
		align-items: center;
		background-color: white;
		border-radius: 5px;
		border: 1px solid var(--border-color);
	}
	.statistic-value {
		text-align: right;
	}
</style>
