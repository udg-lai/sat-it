<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		decision: VariableAssignment;
		expanded: boolean;
		propagations?: VariableAssignment[];
		isLast: boolean;
	}

	let { decision, expanded, propagations = [], isLast }: Props = $props();
</script>

{#if propagations?.length === 0}
	<ChildlessDecisionComponent assignment={decision} {isLast} />
{:else}
	<DecisionComponent {expanded} assignment={decision} {isLast} />
	{#if expanded}
		{#each propagations as assignment (assignment.variableId())}
			{#if assignment.isK()}
				<BacktrackingComponent {assignment} {isLast} />
			{:else}
				<UnitPropagationComponent {assignment} {isLast} />
			{/if}
		{/each}
	{/if}
{/if}
