<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		decision: VariableAssignment;
		propagations?: VariableAssignment[];
	}

	let { decision, propagations = [] }: Props = $props();

	let expanded: boolean = $state(true);
</script>

{#if propagations?.length === 0}
	<ChildlessDecisionComponent assignment={decision} />
{:else}
	<DecisionComponent assignment={decision} bind:expanded />
	{#if expanded}
		{#each propagations as assignment (assignment.variableId())}
			{#if assignment.isK()}
				<BacktrackingComponent {assignment} />
			{:else}
				<UnitPropagationComponent {assignment} />
			{/if}
		{/each}
	{/if}
{/if}
