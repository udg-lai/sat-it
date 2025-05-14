<script lang="ts">
	import type VariableAssignment from '$lib/transversal/entities/VariableAssignment.ts';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		decision: VariableAssignment;
		propagations?: VariableAssignment[];
		expanded: boolean;
		emitExpand?: () => void;
		emitClose?: () => void;
	}

	let { decision, propagations = [], expanded, emitClose, emitExpand }: Props = $props();
</script>

<decision-level class:expanded>
	{#if propagations?.length === 0}
		<ChildlessDecisionComponent assignment={decision} />
	{:else}
		<DecisionComponent assignment={decision} bind:expanded {emitClose} {emitExpand} />
		{#if expanded}
			{#each propagations as assignment}
				{#if assignment.isK()}
					<BacktrackingComponent {assignment} />
				{:else}
					<UnitPropagationComponent {assignment} />
				{/if}
			{/each}
		{/if}
	{/if}
</decision-level>

<style>
	decision-level {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		height: 100%;
		transition: flex 0.1s ease-in;
	}
</style>
