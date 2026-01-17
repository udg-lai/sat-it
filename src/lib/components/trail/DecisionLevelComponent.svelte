<script lang="ts">
	import type VariableAssignment from '$lib/entities/VariableAssignment.ts';
	import { differOf } from '$lib/states/trail-differ-sequence.svelte.ts';
	import type { ComposedTrail } from '$lib/types/types.ts';
	import BackjumpingComponent from '../assignment/BackjumpingComponent.svelte';
	import BacktrackingComponent from '../assignment/BacktrackingComponent.svelte';
	import ChildlessDecisionComponent from '../assignment/ChildlessDecisionComponent.svelte';
	import DecisionComponent from '../assignment/DecisionComponent.svelte';
	import UnitPropagationComponent from '../assignment/UnitPropagationComponent.svelte';

	interface Props {
		composedTrail: ComposedTrail;
		decision: VariableAssignment;
		dlLevel: number;
		propagations?: VariableAssignment[];
		emitRevertUpToX: () => void;
	}

	let { composedTrail, decision, dlLevel, propagations = [], emitRevertUpToX }: Props = $props();

	let expandedDL = $derived(composedTrail.trail.isDLExpanded(dlLevel));

	const toggleDL = (): void => {
		composedTrail.trail.toggleDLExpanded(dlLevel);
	};
</script>

<decision-level>
	{#if propagations?.length === 0}
		<ChildlessDecisionComponent
			assignment={decision}
			isLast={composedTrail.isLast}
			fromPreviousTrail={composedTrail.trail.indexOfAssignment(decision) <
				differOf(composedTrail.id)}
			{emitRevertUpToX}
		/>
	{:else}
		<DecisionComponent
			expanded={!expandedDL}
			assignment={decision}
			isLast={composedTrail.isLast}
			emitToggle={toggleDL}
			fromPreviousTrail={composedTrail.trail.indexOfAssignment(decision) <
				differOf(composedTrail.id)}
			{emitRevertUpToX}
		/>
		{#if expandedDL}
			{#each propagations as assignment (assignment.toVar())}
				{#if assignment.isK()}
					<BacktrackingComponent
						{assignment}
						isLast={composedTrail.isLast}
						fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
							differOf(composedTrail.id)}
					/>
				{:else if assignment.isBJ()}
					<BackjumpingComponent
						{assignment}
						isLast={composedTrail.isLast}
						fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
							differOf(composedTrail.id)}
						detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
					/>
				{:else}
					<UnitPropagationComponent
						{assignment}
						isLast={composedTrail.isLast}
						fromPreviousTrail={composedTrail.trail.indexOfAssignment(assignment) <
							differOf(composedTrail.id)}
						detailsExpanded={composedTrail.showCA || composedTrail.showUPs}
					/>
				{/if}
			{/each}
		{/if}
	{/if}
</decision-level>


<style>
	decision-level {
		display: flex;
		flex-direction: row;
		gap: var(--assignments-gap);
	}
</style>