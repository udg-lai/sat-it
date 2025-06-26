<script lang="ts">
	import { algorithmicUndo } from '$lib/alogrithmicUndo.svelte.ts';
	import type { Trail } from '$lib/entities/Trail.svelte.ts';
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		decision: VariableAssignment;
		expanded: boolean;
		propagations?: VariableAssignment[];
		isLast?: boolean;
		trail: Trail;
	}

	let { decision, expanded, propagations = [], isLast = false, trail }: Props = $props();
</script>

{#if propagations?.length === 0}
	<ChildlessDecisionComponent
		assignment={decision}
		{isLast}
		fromPreviousTrail={trail.isAssignmentFromPreviousTrail(decision)}
		emitUndo={() => algorithmicUndo(decision, trail)}
	/>
{:else}
	<DecisionComponent
		{expanded}
		assignment={decision}
		{isLast}
		emitToggle={() => (expanded = !expanded)}
		fromPreviousTrail={trail.isAssignmentFromPreviousTrail(decision)}
		emitUndo={() => algorithmicUndo(decision, trail)}
	/>
	{#if expanded}
		{#each propagations as assignment (assignment.variableId())}
			{#if assignment.isK()}
				<BacktrackingComponent
					{assignment}
					{isLast}
					fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
				/>
			{:else if assignment.isBJ()}
				<BackjumpingComponent
					{assignment}
					{isLast}
					fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
				/>
			{:else}
				<UnitPropagationComponent
					{assignment}
					{isLast}
					fromPreviousTrail={trail.isAssignmentFromPreviousTrail(assignment)}
				/>
			{/if}
		{/each}
	{/if}
{/if}
