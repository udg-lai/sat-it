<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { differPos } from '$lib/states/trail-diff-start.svelte.ts';
	import type { ComposedTrail } from '$lib/types/types.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		trail: ComposedTrail;
		decision: VariableAssignment;
		propagations?: VariableAssignment[];
		emitRevertUpToX: () => void;
	}

	let { trail, decision, propagations = [], emitRevertUpToX }: Props = $props();
</script>

{#if propagations?.length === 0}
	<ChildlessDecisionComponent
		assignment={decision}
		isLast={trail.isLast}
		fromPreviousTrail={trail.trail.indexOfAssignment(decision) < differPos(trail.index)}
		{emitRevertUpToX}
	/>
{:else}
	<DecisionComponent
		expanded={trail.expanded}
		assignment={decision}
		isLast={trail.isLast}
		emitToggle={() => (trail.expanded = !trail.expanded)}
		fromPreviousTrail={trail.trail.indexOfAssignment(decision) < differPos(trail.index)}
		{emitRevertUpToX}
	/>
	{#if trail.expanded}
		{#each propagations as assignment (assignment.toVar())}
			{#if assignment.isK()}
				<BacktrackingComponent
					{assignment}
					isLast={trail.isLast}
					fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
				/>
			{:else if assignment.isBJ()}
				<BackjumpingComponent
					{assignment}
					isLast={trail.isLast}
					fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
					detailsExpanded={trail.showCA || trail.showUPs}
					showUPInfo={!trail.showUPs}
				/>
			{:else}
				<UnitPropagationComponent
					{assignment}
					isLast={trail.isLast}
					fromPreviousTrail={trail.trail.indexOfAssignment(assignment) < differPos(trail.index)}
					detailsExpanded={trail.showCA || trail.showUPs}
					showUPInfo={!trail.showUPs}
				/>
			{/if}
		{/each}
	{/if}
{/if}
